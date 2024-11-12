from flask import Flask, request, make_response, jsonify  # Import necessary modules
import subprocess  # Import subprocess to run external commands
import json  # Import json module to handle JSON data
import os
from flask_cors import CORS  # Import CORS to handle cross-origin requests

app = Flask(__name__)  # Create a new Flask app

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Allow requests from your frontend

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'  # Allow your frontend
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'  # Allow specific methods
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'  # Allow specific headers
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

# Load posts from JSON file
def load_posts(file_path):
    absolute_path = os.path.join(os.getcwd(), file_path)  # Get the absolute path
    print("Loading posts from:", absolute_path)  # Print the absolute path
    with open(absolute_path, 'r') as file:
        return json.load(file)  # Use json to load data from the file

# Save posts to JSON file
def save_posts(file_path, posts):
    with open(file_path, 'w') as file:
        json.dump(posts, file, indent=4)

# Generate final post using Ollama
def generate_final_post(rough_draft): 
    # Combine the prompt with the rough draft
    input_text = PROMPT + rough_draft
    # Call Ollama to polish the rough draft
    result = subprocess.run(['ollama', 'run', 'llama3.1'], input=input_text, capture_output=True, text=True)
    return result.stdout.strip()

@app.route('/api/posts', methods=['GET'])  # Define an endpoint to get posts
def get_posts():
    print("GET /api/posts called")  # Confirm the endpoint is hit
    posts = load_posts('posts.json')  # Load posts from JSON file
    return jsonify(posts)  # Return posts as JSON

@app.route('/api/posts', methods=['POST'])  # Define an endpoint to create a new post
def create_post():
    print("POST /api/posts called")  # Confirm the endpoint is hit
    new_post_data = request.json  # Get the JSON data sent from the frontend
    new_rough_draft = new_post_data['rough_draft']  # Extract the rough draft

    # Check for duplicates
    posts = load_posts('posts.json')
    if any(post['rough_draft'] == new_rough_draft for post in posts['posts']):
        return jsonify({"error": "This rough draft already exists."}), 400  # Return error if duplicate

    new_post = {
        "id": len(posts['posts']) + 1,
        "rough_draft": new_rough_draft,
        "final_post": "",
        "status": "pending"
    }
    posts['posts'].append(new_post)

    # Generate final post
    new_post['final_post'] = generate_final_post(new_post['rough_draft'])
    new_post['status'] = 'posted'

    # Save updated posts back to JSON file
    save_posts('posts.json', posts)

    return jsonify(new_post), 201  # Return the new post as JSON with a 201 status

@app.route('/', methods=['GET'])  # Define a route for the root URL
def home():
    return "Welcome to the AI Post Manager!"  # Return a welcome message

@app.route('/api/generate_post', methods=['OPTIONS', 'POST'])  # Define a new endpoint for generating posts
def generate_post():
    # Handle the OPTIONS request (preflight)
    if request.method == 'OPTIONS':
        response = make_response()  # Create a response object
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'  # Allow your frontend
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'  # Allow specific methods
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'  # Allow specific headers
        response.headers['Access-Control-Max-Age'] = '3600'  # Cache preflight response for 1 hour
        return response  # Return the response for the OPTIONS request

    # Handle the POST request
    data = request.json  # Get JSON data from the request
    rough_draft = data.get('rough_draft')  # Extract 'rough_draft'

    if not rough_draft:  # Check if 'rough_draft' is provided
        return jsonify({"error": "Rough draft is required"}), 400  # Return error if missing

    try:
        # Generate the final post using your helper function
        final_post = generate_final_post(rough_draft)  # Call the function to generate the final post
        response = jsonify({"final_post": final_post})  # Create a JSON response with the final post
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'  # Allow your frontend
        return response  # Return the response with the generated post
    except Exception as e:  # Handle any exceptions that occur
        return jsonify({"error": str(e)}), 500  # Return error message with a 500 status

# LinkedIn Bot Prompt
PROMPT = '''
Create a post under 280 characters that is concise, impactful, and to the point. Capture the main idea clearly and keep it engaging for readers who want a quick takeaway.
'''

if __name__ == "__main__":
    app.run(debug=True)  # Start the Flask server
