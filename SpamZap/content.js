console.log("WhatsApp Spam Detector loaded");

// Map to keep track of processed messages with timestamps
let processedMessages = new Map();

// Function to detect new messages
function detectMessages() {
    let chatContainers = document.querySelectorAll('.message-in, .message-out'); // Check WhatsApp's DOM structure
    chatContainers.forEach(chat => {
        let messageElement = chat.querySelector('.copyable-text');
        let messageText = messageElement ? messageElement.innerText : '';

        if (messageText) {
            // Check if the message is already processed
            if (!processedMessages.has(messageText)) {
                processedMessages.set(messageText, Date.now()); // Add the message to the map with a timestamp
                console.log("Detected message: ", messageText);
                checkForSpam(messageText, chat); // Analyze message for spam/fraud
            }
        }
    });
}

// Function to send message to the Flask server for spam detection
async function checkForSpam(text, messageElement) {
    try {
        const response = await fetch('http://localhost:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: text }),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.spam) {
                console.log("Spam detected: ", text);
                flagMessage(messageElement);
            }
        } else {
            console.error("Error in spam detection request:", response.statusText);
        }
    } catch (error) {
        console.error("Error while checking for spam:", error);
    }
}

// Function to flag suspicious messages visually
function flagMessage(element) {
    element.style.border = "2px solid red"; // Highlight the message
    element.setAttribute('title', 'Potential spam detected!');
}

// Function to initialize the MutationObserver
function initMutationObserver() {
    const chatContainer = document.querySelector('#main .copyable-area'); // Adjust this selector if necessary

    if (chatContainer) {
        const observer = new MutationObserver(detectMessages);
        observer.observe(chatContainer, { childList: true, subtree: true });
        console.log("MutationObserver initialized.");
    } else {
        console.error("Chat container not found. Retrying...");
        setTimeout(initMutationObserver, 1000); // Retry after 1 second if not found
    }
}

// Initial detection and MutationObserver setup
detectMessages();
initMutationObserver();
