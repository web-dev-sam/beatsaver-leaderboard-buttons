
// Open a sample page where the buttons are added after installation
chrome.runtime.onInstalled.addListener(function() {
    chrome.tabs.create({
        url: 'https://scoresaber.com/leaderboard/371613',
    });
});
