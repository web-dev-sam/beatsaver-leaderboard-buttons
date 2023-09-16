
log("Started Extension!");


document.addEventListener('DOMContentLoaded', async () => {
    let path = "";

    // Check every second if we are on the leaderboard page, if so load the buttons if we haven't already
    window.setInterval(async () => {
        if (path !== window.location.pathname && window.location.pathname.includes("leaderboard/")) {
            const element = document.querySelector(".ssbtns-wrapper");
            const elementExists = element !== null;
            if (!elementExists) {
                path = window.location.pathname;
                await load();
            }
        }
    }, 1000);
});


async function load() {

    // Get leaderboard id from url
    const leaderboardId = window.location.pathname.split('/').pop();
    if (leaderboardId == null) {
        log(`Failed to get leaderboard ID from URL ${window.location.pathname}`);
        return;
    }

    // Get leaderboardInfos from scoresaber leaderboard api
    const leaderboardInfos = await fetchLeaderboardInfos(leaderboardId);
    if (leaderboardInfos == null) {
        log(`Failed to get leaderboard information from URL ${SCORESABER_LEADERBOARD_API.replace('{0}', leaderboardId)}`);
        return;
    }

    // Get the songHash from the leaderboardInfos
    const songHash = leaderboardInfos.songHash?.toLowerCase();
    if (!songHash) {
        log(`Couldn't find song hash in leaderboard information:`, leaderboardInfos);
        return;
    }

    // Get the beatmap from beatsaver api
    const beatsaverURL = BEATSAVER_API.replace('{0}', songHash);
    const beatleaderUIDFetchURL = `https://beatsaver.com/api/scores/${songHash}/1?difficulty=${leaderboardInfos.difficulty.difficulty}&type=BeatLeader`; // "?difficulty=9&gameMode=0&type=BeatLeader"
    const [{ value: beatleader }, { value: beatmap }] = await Promise.allSettled([
        safeFetch(beatleaderUIDFetchURL),
        safeFetch(beatsaverURL),
    ]);
    if (beatmap == null) {
        log(`Failed to get beatsaver data from URL:`, beatsaverURL);
        return;
    }

    const beatKey = beatmap.id;
    if (beatKey == null) {
        log(`Failed to get map bsr code from beatsaver data:`, beatmap, beatsaverURL);
        return;
    }

    const quickInstallURL = QUICK_INSTALL_URL.replace('{0}', beatKey);
    const bsrCopy = `!bsr ${beatKey}`;
    const beatsaverPage = `https://beatsaver.com/maps/${beatKey}`;
    const beatleaderLeaderboardURL = beatleader.uid ? `https://www.beatleader.xyz/leaderboard/global/${beatleader.uid}` : null;
    const downloadURL = `https://eu.cdn.beatsaver.com/${songHash}.zip`;

    log(beatsaverURL);
    log(downloadURL);
    log(quickInstallURL);
    log(beatleaderLeaderboardURL);
    log(bsrCopy);

    // Add buttons
    function addButtons() {
        const buttonParents = Array.from(document.getElementsByClassName("card-content"))
                            .filter(e => e.innerText.includes(leaderboardInfos.songName));
        if (buttonParents.length === 0) {
            log("Didn't find the place to add buttons!");
            return false;
        }

        const buttonParent = buttonParents[0];
        const buttonContainer = document.createElement("div");
        const twitchButtonHTML = `<div class="twitch" title="!bsr"><i class="fab fa-twitch"></i></div>`;
        const quickInstallButtonHTML = `<div class="quick" title="One-Click"><i class="fas fa-cloud-download-alt"></i></div>`;
        const beatsaverButtonHTML = `
        <div class="beatsaver" title="BeatSaver">
        <svg viewBox="0 0 177 177" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M3.51472 79.8822C-1.17157 84.5685 -1.17157 92.1665 3.51472 96.8528L79.8823 173.22C84.5685 177.907 92.1665 177.907 96.8528 173.22L173.22 96.8528C177.907 92.1665 177.907 84.5685 173.22 79.8823L96.8528 3.51472C92.1665 -1.17157 84.5685 -1.17157 79.8823 3.51472L3.51472 79.8822ZM144.529 83.309C146.086 84.8663 146.086 87.3912 144.529 88.9485L88.9486 144.529C87.3912 146.086 84.8664 146.086 83.3091 144.529C82.3293 143.549 81.9283 142.131 82.25 140.783L91.2463 103.094C92.6467 97.2274 97.2274 92.6467 103.094 91.2463L140.783 82.25C142.131 81.9283 143.549 82.3292 144.529 83.309Z" />
        </svg>
        </div>`;
        const downloadButtonHTML = `<div class="download" title="Download Files"><i class="fas fa-download"></i></div>`;
        const beatleaderLeaderboardHTML = `<div class="beatleader" title="Open BeatLeader Leaderboard"><svg width="269" height="254" viewBox="0 0 269 254" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_761_37)">
        <path d="M173.792 133.373C177.331 111.567 162.522 91.0201 140.716 87.481C118.91 83.942 98.3631 98.7506 94.824 120.557C91.285 142.363 106.094 162.91 127.9 166.449C149.706 169.988 170.253 155.179 173.792 133.373Z" fill="white"/>
        <path d="M233.3 19.2C238.2 19.2 242.1 23.2 242.1 28V225.8C242.1 230.7 238.1 234.6 233.3 234.6H35.3999C30.4999 234.6 26.5999 230.6 26.5999 225.8V28C26.5999 23.1 30.5999 19.2 35.3999 19.2H233.3ZM233.3 0H35.3999C19.8999 0 7.3999 12.5 7.3999 28V225.9C7.3999 241.4 19.8999 253.9 35.3999 253.9H233.3C248.8 253.9 261.3 241.4 261.3 225.9V28C261.3 12.5 248.7 0 233.3 0Z" fill="white"/>
        </g>
        <defs>
        <clipPath id="clip0_761_37">
        <rect width="268.7" height="253.9" fill="white"/>
        </clipPath>
        </defs>
        </svg>
        </div>
        `;
        buttonContainer.innerHTML = `
            <style>
                .ssbtns-wrapper {
                    display: flex;
                }
                .ssbtns-wrapper > div {
                    margin-right: 1rem;
                    cursor: pointer;
                    transition: background .25s ease;
                    padding: 0.3rem;
                    border-radius: 5px;
                    width: 2rem;
                    height: 2rem;
                    text-align: center;
                }
                .ssbtns-wrapper svg path {
                    fill: #fff;
                }
                .ssbtns-wrapper > div:hover,
                .ssbtns-wrapper > div:hover svg path {
                    fill: var(--scoreSaberYellow);
                    background: #fff2;
                    color: var(--scoreSaberYellow);
                }
                .ssbtns-wrapper i,
                .ssbtns-wrapper svg {
                    font-size: 1.1rem;
                    width: 1.3rem;
                    height: 1.2rem;
                    vertical-align: middle;
                }
            </style>
            <div class="ssbtns-wrapper">
                ${twitchButtonHTML}
                ${quickInstallButtonHTML}
                ${beatsaverButtonHTML}
                ${beatleaderLeaderboardHTML}
                ${downloadButtonHTML}
            </div>
        `;
        buttonParent.appendChild(buttonContainer);

        const twitchButton = buttonContainer.getElementsByClassName("twitch")[0];
        const quickInstallButton = buttonContainer.getElementsByClassName("quick")[0];
        const downloadButton = buttonContainer.getElementsByClassName("download")[0];
        const beatsaverButton = buttonContainer.getElementsByClassName("beatsaver")[0];
        const beatleaderButton = buttonContainer.getElementsByClassName("beatleader")[0];

        twitchButton.addEventListener("click", () => {
            navigator.clipboard.writeText(bsrCopy);
        });

        quickInstallButton.addEventListener("click", () => {
            window.open(quickInstallURL);
        });

        beatsaverButton.addEventListener("click", () => {
            window.open(beatsaverPage);
        });

        downloadButton.addEventListener("click", () => {
            window.open(downloadURL);
        });

        beatleaderButton.addEventListener("click", () => {
            window.open(beatleaderLeaderboardURL);
        });

        return true;
    }


    // Add buttons and retry in 2 seconds if it fails
    if (!addButtons()) {
        const retryTimeout = 2000;
        setTimeout(() => addButtons(), retryTimeout);
    }
}

