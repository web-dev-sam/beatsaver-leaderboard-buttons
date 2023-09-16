const BEATSAVER_API = "https://beatsaver.com/api/maps/hash/{0}";
const SCORESABER_LEADERBOARD_API = "https://scoresaber.com/api/leaderboard/by-id/{0}/info";
const QUICK_INSTALL_URL = "beatsaver://{0}";


/**
 * This highlights logs by this extension. So just a console.log wrapper with some styling.
 */
function log(...msg) {
    const css = `
        font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
        background-color: #671DFD;
        color: #fff;
        font-size: 90%;
        padding: 0.2rem 0.3rem;
    `;
    console.log("%cScoreSaber Buttons", css, ...msg);
}


/**
 * Fetches the leaderboard info from scoresaber.
 * @returns {Promise<Object|null>} The leaderboard info or null if fetching didn't succeed.
 */
function fetchLeaderboardInfos(leaderboardId) {
    return new Promise(resolve => {
        fetch(SCORESABER_LEADERBOARD_API.replace('{0}', leaderboardId)).then(response => response.json()).then(data => {
            if (data == null) {
                throw new Error('No leaderboeard data found!');
            }
            resolve(data);
        }).catch(error => {
            log("Error fetching leaderboard infos: ", error);
            resolve(null);
        }).finally(() => {
            resolve(null);
        });
    });
}


/**
 * Fetches the beatmap from beatsaver.
 * @returns {Promise<Object|null>} The beatmap or null if fetching didn't succeed.
 */
function safeFetch(beatsaverURL) {
    return new Promise(resolve => {
        fetch(beatsaverURL).then(response => response.json()).then(data => {
            if (data == null) {
                throw new Error('No beatsaver data found!');
            }
            resolve(data);
        }).catch(error => {
            log("Error fetching beatmap: ", error);
            resolve(null);
        }).finally(() => {
            resolve(null);
        });
    });
}
