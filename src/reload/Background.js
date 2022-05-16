import { parentClient, ChromeMessage, reload } from '../chrome';

const eventSource = new EventSource('http://localhost:8080/reload/');
eventSource.addEventListener('compiled successfully', () => {
    // eslint-disable-next-line no-undef
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs.length > 0) {
            const res = await parentClient.sendMessage(new ChromeMessage('refresh page'));
            if (res) {
                reload();
            }
        }
    });
});
