
log("Started Extension!");


document.addEventListener('DOMContentLoaded', async () => {

    // Get leaderboard id from url
    const leaderboardId = window.location.pathname.split('/').pop();
    if (leaderboardId == null) {
        return;
    }

    // Get leaderboardInfos from scoresaber leaderboard api
    const leaderboardInfos = await fetchLeaderboardInfos(leaderboardId);
    if (leaderboardInfos == null) {
        return;
    }

    // Get the songHash from the leaderboardInfos
    const songHash = leaderboardInfos.songHash;
    if (!songHash) {
        return;
    }
    const beatsaverURL = BEATSAVER_API.replace('{0}', songHash);
    const downloadURL = `https://eu.cdn.beatsaver.com/${songHash.toLowerCase()}.zip`;

    // Get the beatmap from beatsaver api
    const beatmap = await fetchBeatmap(beatsaverURL);
    if (beatmap == null) {
        return;
    }

    const beatKey = beatmap.id;
    const quickInstallURL = QUICK_INSTALL_URL.replace('{0}', beatKey);
    const bsrCopy = `!bsr ${beatKey}`;
    const beatsaverPage = `https://beatsaver.com/maps/${beatKey}`;

    log(beatsaverURL);
    log(downloadURL);
    log(quickInstallURL);
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
                <div class="twitch" title="!bsr"><i class="fab fa-twitch"></i></div>
                <div class="quick" title="One-Click"><i class="fas fa-cloud-download-alt"></i></div>
                <div class="beatsaver" title="BeatSaver">
                <svg viewBox="0 0 177 177" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M3.51472 79.8822C-1.17157 84.5685 -1.17157 92.1665 3.51472 96.8528L79.8823 173.22C84.5685 177.907 92.1665 177.907 96.8528 173.22L173.22 96.8528C177.907 92.1665 177.907 84.5685 173.22 79.8823L96.8528 3.51472C92.1665 -1.17157 84.5685 -1.17157 79.8823 3.51472L3.51472 79.8822ZM144.529 83.309C146.086 84.8663 146.086 87.3912 144.529 88.9485L88.9486 144.529C87.3912 146.086 84.8664 146.086 83.3091 144.529C82.3293 143.549 81.9283 142.131 82.25 140.783L91.2463 103.094C92.6467 97.2274 97.2274 92.6467 103.094 91.2463L140.783 82.25C142.131 81.9283 143.549 82.3292 144.529 83.309Z" />
                </svg>
                </div>
                <div class="download" title="Download Files"><i class="fas fa-download"></i></div>
            </div>
        `;
        buttonParent.appendChild(buttonContainer);

        const twitchButton = buttonContainer.getElementsByClassName("twitch")[0];
        const quickInstallButton = buttonContainer.getElementsByClassName("quick")[0];
        const downloadButton = buttonContainer.getElementsByClassName("download")[0];
        const beatsaverButton = buttonContainer.getElementsByClassName("beatsaver")[0];

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

        return true;
    }


    // Add buttons and retry in 2 seconds if it fails
    if (!addButtons()) {
        const retryTimeout = 2000;
        setTimeout(() => addButtons(), retryTimeout);
    }


});

