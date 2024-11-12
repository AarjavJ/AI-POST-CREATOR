'use client' // This tells the app that this part of the code can change things on the page.

import { useState } from 'react' // We are bringing in a tool to help us keep track of things that can change.
import { motion } from 'framer-motion' // This helps us make cool animations.
import { Textarea } from "@/components/ui/textarea" // We are using a special box for typing.
import { Button } from "@/components/ui/button" // We are using a button that we can click.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // We are using a card to hold our content nicely.
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // We are using tabs to switch between different posts.
import { Loader2 } from 'lucide-react' // This is an icon that shows we are loading something.

export function IdeaToPostConverterComponent() { // This is a special function that makes our component work.
  const [input, setInput] = useState('') // We are creating a box to hold what the user types.
  const [isGenerating, setIsGenerating] = useState(false) // This tells us if we are making posts right now.
  const [xPost, setXPost] = useState('') // This will hold the post for X.
  const [linkedInPost, setLinkedInPost] = useState('') // This will hold the LinkedIn post.
  const [copied, setCopied] = useState({ x: false, linkedin: false }) // This tells us if we copied the posts.

  const generatePosts = async () => { // This is a function to make the posts.
    setIsGenerating(true) // We say we are starting to make posts.
    
    try {
      const response = await fetch('http://localhost:5000/api/generate_post', { // Use the full URL for the backend
        method: 'POST', // We are sending data to create a new post.
        headers: {
          'Content-Type': 'application/json', // We are telling the backend we are sending JSON data.
        },
        body: JSON.stringify({ rough_draft: input }), // We send the input as rough_draft.
      });

      if (!response.ok) { // If the response is not okay, throw an error.
        throw new Error('Network response was not ok');
      }

      const data = await response.json(); // Get the JSON data from the response.
      setXPost(data.final_post); // Set the X post with the generated post from the backend.
      setLinkedInPost(data.final_post); // Set the LinkedIn post with the same generated post.
    } catch (error) {
      console.error('Error generating posts:', error); // Log any errors that occur.
    } finally {
      setIsGenerating(false); // We say we are done making posts.
    }
  }

  const copyToClipboard = (text: string, platform: 'x' | 'linkedin') => { // This function copies the text to the clipboard.
    navigator.clipboard.writeText(text) // We copy the text to the clipboard.
    setCopied({ ...copied, [platform]: true }) // We say we copied the post for the right platform.
    setTimeout(() => setCopied({ ...copied, [platform]: false }), 2000) // After 2 seconds, we say we are not copied anymore.
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { // This function checks what key is pressed.
    if (e.key === 'Enter' && !e.shiftKey && input.trim() && !isGenerating) { // If the Enter key is pressed and we are not making posts...
      e.preventDefault(); // We stop the default action of the Enter key.
      generatePosts(); // We call the function to make posts.
    }
  }

  return ( // This is what we show on the screen.
    <div className="max-w-2xl mx-auto p-4"> {/* This makes a nice box in the middle of the screen. */}
      <Card> {/* We start our card. */}
        <CardHeader> {/* This is the top part of the card. */}
          <CardTitle>Convert your IDEAS into POSTS</CardTitle> {/* This is the title of our card. */}
        </CardHeader>
        <CardContent className="space-y-4"> {/* This is the main part of the card with some space between items. */}
          <Textarea // This is where the user types their idea.
            placeholder="Enter your idea here..." // This is a hint that tells the user what to do.
            value={input} // This shows what the user has typed.
            onChange={(e) => setInput(e.target.value)} // When the user types, we update the input.
            onKeyDown={handleKeyPress} // We check for key presses in this box.
            rows={4} // This sets how many lines the box shows.
          />
          <div className="text-sm text-muted-foreground mt-1"> {/* This is a small note below the text area. */}
            Press Enter to start converting or Shift+Enter for a new line. {/* This tells the user how to use the box. */}
          </div>
          <Button onClick={generatePosts} disabled={isGenerating || !input.trim()}> {/* This is the button to make posts. */}
            {isGenerating ? ( // If we are making posts...
              <>
                <motion.div // This is the spinning loader while we are generating.
                  animate={{ rotate: 360 }} // This makes it spin.
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }} // This controls how it spins.
                  className="mr-2" // This adds some space to the right of the loader.
                >
                  <Loader2 className="h-4 w-4" /> {/* This is the loader icon. */}
                </motion.div>
                Converting... {/* This shows that we are converting. */}
              </>
            ) : (
              'Convert to Posts' // This shows the button text when we are not generating.
            )}
          </Button>

          {(xPost || linkedInPost) && ( // If we have either post...
            <Tabs defaultValue="x" className="mt-4"> {/* We start the tabs for switching between posts. */}
              <TabsList> {/* This is the list of tabs. */}
                <TabsTrigger value="x">X Post</TabsTrigger> {/* This is the tab for the X post. */}
                <TabsTrigger value="linkedin">LinkedIn Post</TabsTrigger> {/* This is the tab for the LinkedIn post. */}
              </TabsList>
              <TabsContent value="x"> {/* This is the content for the X post tab. */}
                <Card> {/* We start a new card for the X post. */}
                  <CardContent className="pt-4"> {/* This is the main part of the card. */}
                    <div className="flex flex-col space-y-2"> {/* This makes a column with space between items. */}
                      <Textarea value={xPost} readOnly rows={4} className="w-full" /> {/* This shows the X post in a box that can't be edited. */}
                      <Button // This is the button to copy the X post.
                        variant="outline" // This makes the button look like an outline.
                        size="sm" // This sets the size of the button.
                        className="self-end" // This makes the button align to the end of the box.
                        onClick={() => copyToClipboard(xPost, 'x')} // When clicked, it copies the X post.
                      >
                        {copied.x ? 'Copied!' : 'COPY'} {/* This shows 'Copied!' if we copied, otherwise 'COPY'. */}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="linkedin"> {/* This is the content for the LinkedIn post tab. */}
                <Card> {/* We start a new card for the LinkedIn post. */}
                  <CardContent className="pt-4"> {/* This is the main part of the card. */}
                    <div className="flex flex-col space-y-2"> {/* This makes a column with space between items. */}
                      <Textarea value={linkedInPost} readOnly rows={4} className="w-full" /> {/* This shows the LinkedIn post in a box that can't be edited. */}
                      <Button // This is the button to copy the LinkedIn post.
                        variant="outline" // This makes the button look like an outline.
                        size="sm" // This sets the size of the button.
                        className="self-end" // This makes the button align to the end of the box.
                        onClick={() => copyToClipboard(linkedInPost, 'linkedin')} // When clicked, it copies the LinkedIn post.
                      >
                        {copied.linkedin ? 'Copied!' : 'COPY'} {/* This shows 'Copied!' if we copied, otherwise 'COPY'. */}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}