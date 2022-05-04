export const getPageInfo = () => new Promise((resolve) => {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, async (tabs) => {
        console.log(tabs, 88);
        const tab = tabs[0];
        resolve(tab);
    });
});
