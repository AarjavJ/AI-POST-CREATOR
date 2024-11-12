import React, { useEffect, useState } from 'react';

function App() {
    const [posts, setPosts] = useState([]);  // State to hold posts
    const [newIdea, setNewIdea] = useState('');  // State for new idea input
    const [newRoughDraft, setNewRoughDraft] = useState('');  // State for new rough draft input

    useEffect(() => {
        fetch('/api/posts')  // Fetch posts from the backend
            .then(response => response.json())  // Convert response to JSON
            .then(data => setPosts(data.posts));  // Update state with posts
    }, []);  // Run once when the component mounts

    const handleSubmit = () => {
        fetch('/api/posts', {  // Send new post to the backend
            method: 'POST',  // Specify the method as POST
            headers: {
                'Content-Type': 'application/json',  // Indicate that we're sending JSON
            },
            body: JSON.stringify({ idea: newIdea, rough_draft: newRoughDraft }),  // Convert data to JSON
        })
        .then(response => {
            if (!response.ok) {  // Check if the response is not okay
                throw new Error('Network response was not ok');  // Throw an error
            }
            return response.json();  // Convert response to JSON
        })
        .then(data => {
            setPosts(prevPosts => [...prevPosts, data]);  // Add new post to state
            setNewIdea('');  // Clear the input field
            setNewRoughDraft('');  // Clear the input field
        })
        .catch(error => console.error('Error:', error));  // Log any errors
    };

    return (
        <div>
            <h1>Posts</h1>
            <ul>
                {posts.map(post => (  // Map through posts and display them
                    <li key={post.id}>{post.idea}: {post.final_post}</li>
                ))}
            </ul>
            <input value={newIdea} onChange={e => setNewIdea(e.target.value)} placeholder="New Idea" />  // Input for new idea
            <input value={newRoughDraft} onChange={e => setNewRoughDraft(e.target.value)} placeholder="Rough Draft" />  // Input for rough draft
            <button onClick={handleSubmit}>Submit</button>  // Button to submit new post
        </div>
    );
}

export default App;  // Export the App component 