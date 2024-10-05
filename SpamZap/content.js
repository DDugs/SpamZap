console.log("SpamZap Detector loaded");

let processedMessages = new Map();
function detectMessages() {
    let chatContainers = document.querySelectorAll('.message-in, .message-out');
    chatContainers.forEach(chat => {
        let messageElement = chat.querySelector('.copyable-text');
        let messageText = messageElement ? messageElement.innerText : '';

        if (messageText) {
            if (!processedMessages.has(messageText)) {
                processedMessages.set(messageText, Date.now());
                if (chat.classList.contains('message-in')) {
                    console.log("Stranger: ", messageText);
                } else if (chat.classList.contains('message-out')) {
                    console.log("You: ", messageText);
                }

                detectLinks(messageText, messageElement);
                checkForSpam(messageText, messageElement);
            }
        }
    });
}

function detectLinks(text, messageElement) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlPattern);

    if (urls) {
        urls.forEach(async (url) => {
            console.log("Detected URL:", url);

            try {
                const previewResponse = await fetch(`https://opengraph.io/api/1.1/site/${encodeURIComponent(url)}?app_id=your_api_key_here`); //add your opengraph api key here (get it from opengraph.io)
                const previewData = await previewResponse.json();
                if (previewData && previewData.hybridGraph) {
                    console.log("Preview:", previewData.hybridGraph.title, previewData.hybridGraph.description);
                }
            } catch (err) {
                console.error("Error fetching preview:", err);
            }
            try {
                const safeBrowsingResponse = await fetch('http://localhost:5000/checkUrl', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url }),
                });
                
                const safeBrowsingData = await safeBrowsingResponse.json();
                if (safeBrowsingData.malicious) {
                    console.log("Malicious URL detected:", url);
                    flagMessage(messageElement);
                } else {
                    console.log("Safe URL detected:", url);
                }
            } catch (error) {
                console.error("Error checking URL safety:", error);
            }

            const expandedUrl = await expandShortUrl(url);
            if (expandedUrl !== url) {
                console.log("Expanded URL:", expandedUrl);
            }
        });
    }
}

async function expandShortUrl(shortUrl) {
    try {
        const response = await fetch(`http://unshorten.me/json/${encodeURIComponent(shortUrl)}`);
        const data = await response.json();
        if (data.success) {
            return data.resolvedURL;
        }
    } catch (error) {
        console.error("Error expanding URL:", error);
    }
    return shortUrl;
}

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

function flagMessage(element) {
    element.style.border = "2px solid red";
    element.setAttribute('title', 'Potential spam detected!');
}

function observeChat() {
    const chatList = document.querySelector('._1ays2');
    if (chatList) {
        const observer = new MutationObserver(detectMessages);
        observer.observe(chatList, { childList: true, subtree: true });
    }
}

observeChat();
setInterval(detectMessages, 2000);
