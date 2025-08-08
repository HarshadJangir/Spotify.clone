<<<<<<< HEAD
// ✅ Full Spotify-Style Music Player Script.js (All essential functions and behaviors)

let songs = [];
let currfolder = "";
let currentSong = new Audio();
let isShuffle = false;
let isRepeat = false;

function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`;
}

function updateUI(track) {
    const cleanName = decodeURIComponent(track).replace(".mp3", "").replace(".m4a", "");
    document.querySelector(".Info").innerHTML = cleanName;
}

function saveLastPlayed(track) {
    localStorage.setItem("lastSong", track);
    localStorage.setItem("lastFolder", currfolder);
}

async function getsongs(folder) {
    currfolder = folder;
    let res = await fetch(`/${folder}`);
    let html = await res.text();
    let div = document.createElement("div");
    div.innerHTML = html;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let a of as) {
        if (a.href.endsWith(".mp3") || a.href.endsWith(".m4a")) {
            songs.push(a.href.split(`/${folder}/`)[1]);
        }
    }

    let ul = document.querySelector(".PlaylistSongs ul");
    ul.innerHTML = "";
    for (let song of songs) {
        let cleanName = decodeURIComponent(song).replace(".mp3", "").replace(".m4a", "");
        let li = document.createElement("li");
        li.className = "flex justify-between items-center px-2 hover:bg-[#1f1f1f] duration-300 cursor-pointer";
        li.innerHTML = `
            <span class="w-[80%] text-[13px]">${cleanName}</span>
            <div class="playImg h-7 w-7 bg-white rounded-full p-1 flex justify-center items-center">
                <img height="24px" width="24px" src="play.svg" alt="">
            </div>
        `;
        li.addEventListener("click", () => {
            playMusic(song)
            document.getElementById("Hrz").src = "pause.svg";
        });
        ul.appendChild(li);
    }
    return songs;
}

function playMusic(track) {
    currentSong.src = `/${currfolder}/` + track;
    currentSong.play();
    if (currentSong.paused) {
        document.getElementById("Hrz").src = "play.svg";
    }
    else {
        document.getElementById("Hrz").src = "pause.svg";
    }

    updateUI(track);
    saveLastPlayed(track);

    currentSong.ontimeupdate = () => {
        document.querySelector(".goingTime").innerText = formatTime(currentSong.currentTime);
        document.querySelector(".time").innerText = formatTime(currentSong.duration);

        const percent = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".seekcircle").style.left = `${percent}%`;
        document.querySelector(".progress").style.width = `${percent}%`;
    };

    currentSong.onended = () => {
        if (isRepeat) {
            playMusic(track);
        } else if (isShuffle) {
            const randomIndex = Math.floor(Math.random() * songs.length);
            playMusic(songs[randomIndex]);
        } else {
            let index = songs.indexOf(track);
            if (index < songs.length - 1) {
                playMusic(songs[index + 1]);
            } else {
                document.getElementById("Hrz").src = "play.svg";
            }
        }
    };
}

async function displayAlbums() {
    let res = await fetch("/songs/");
    let html = await res.text();
    let div = document.createElement("div");
    div.innerHTML = html;
    let links = div.getElementsByTagName("a");
    let container = document.querySelector(".maincontainer");
    container.innerHTML = "";

    for (let link of links) {
        if (link.href.includes("songs/")) {
            let folder = link.href.split("/").slice(-2)[1];
            let res = await fetch(`/songs/${folder}/info.json`);
            let info = await res.json();

            let card = document.createElement("div");
            card.className = "cardContainer hover:bg-[#1d1d1d] rounded-[10px] h-fit w-[18%] p-3 max-[800px]:w-full max-[800px]:justify-center";
            card.setAttribute("data-folder", folder);
            card.innerHTML = `
                <img src="/songs/${folder}/cover.jpg" alt="">
                <div class="HoverPlay hidden hover:scale-105 p-1.5">
                    <svg viewBox="0 0 24 24"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>
                </div>
                <h2 class="folName font-bold text-[16px] m-0.5 my-2">${info.title}</h2>
                <p class="text-gray-500 text-sm m-0.5 my-2">${info.discription}</p>
            `;
            card.addEventListener("click", async () => {
                songs = await getsongs(`songs/${folder}`);
                playMusic(songs[0]);
            });
            container.appendChild(card);
        }
    }
}

function bindControls() {
    document.getElementById("Play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById("Hrz").src = "pause.svg";
        } else {
            currentSong.pause();
            document.getElementById("Hrz").src = "play.svg";
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`/${currfolder}/`)[1]);
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    document.getElementById("previous").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`/${currfolder}/`)[1]);
        if (index > 0) playMusic(songs[index - 1]);
    });



    document.querySelector(".volume").addEventListener("click", () => {
        let vol = document.querySelector(".volimg");
        if (currentSong.volume > 0) {
            vol.src = "mute.svg";
            currentSong.volume = 0;
            document.querySelector(".rage input").value = 0;

            const volumeSlider = document.getElementById("volumeSlider");
            const audio = currentSong; // or your audio element

            function updateVolumeUI(value) {
                const percent = value;
                volumeSlider.style.background = `linear-gradient(to right, #1ed760 ${percent}%, #2d2d2d ${percent}%)`;
                audio.volume = percent / 100;

            }

            volumeSlider.addEventListener("input", (e) => {
        updateVolumeUI(e.target.value);
    });


    // ✅ Set initial style
    updateVolumeUI(volumeSlider.value);



        } 
        
        
        else {
            vol.src = "volume.svg";
            currentSong.volume = 1;
            document.querySelector(".rage input").value = 100;

            const volumeSlider = document.getElementById("volumeSlider");
            const audio = currentSong; // or your audio element

            function updateVolumeUI(value) {
                const percent = value;
                volumeSlider.style.background = `linear-gradient(to right, #1ed760 ${percent}%, #2d2d2d ${percent}%)`;
                audio.volume = percent / 100;

            }

            volumeSlider.addEventListener("input", (e) => {
        updateVolumeUI(e.target.value);
    });


    // ✅ Set initial style
    updateVolumeUI(volumeSlider.value);
        }
    });

    document.querySelector(".rage input").addEventListener("input", (e) => {
        currentSong.volume = e.target.value / 100;
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let bar = e.currentTarget.getBoundingClientRect();
        let percent = (e.clientX - bar.left) / bar.width;
        currentSong.currentTime = percent * currentSong.duration;
    });


}

async function main() {
    const lastFolder = localStorage.getItem("lastFolder");
    const lastSong = localStorage.getItem("lastSong");

    if (lastFolder && lastSong) {
        songs = await getsongs(lastFolder);
        playMusic(lastSong);
    } else {
        songs = await getsongs("songs/My_playlist");
        playMusic(songs[0]);
    }

    await displayAlbums();
    bindControls();

    document.addEventListener('keydown', function (e) {
        if (e.code === 'Space') {
            if (currentSong.paused) {
                currentSong.play()
                document.getElementById("Hrz").src = "pause.svg"
            }

            else {
                currentSong.pause()
                document.getElementById("Hrz").src = "play.svg"
            }
        }
    })

    const volumeSlider = document.getElementById("volumeSlider");
    const audio = currentSong; // or your audio element

    function updateVolumeUI(value) {
        const percent = value;
        volumeSlider.style.background = `linear-gradient(to right, #1ed760 ${percent}%, #2d2d2d ${percent}%)`;
        audio.volume = percent / 100;

        console.log(volumeSlider.value)
    }

    // 🔁 On input (dragging)
    volumeSlider.addEventListener("input", (e) => {
        updateVolumeUI(e.target.value);
    });


    // ✅ Set initial style
    updateVolumeUI(volumeSlider.value);


    // event to close playlist
    document.getElementById("closeHam").addEventListener("click", () => {
        let clsleft = document.querySelector(".left");
        clsleft.style.left = "-110%"
    })

    document.querySelector(".menu").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })










    document.addEventListener("click", function (event) {
    const sidebar = document.querySelector(".left");
    const menuButton = document.querySelector(".menu");

    // Only apply on mobile (max-width: 1100px)
    if (window.innerWidth <= 1100) {
        // Check if the sidebar is visible (left: 0px or near it)
        const sidebarLeft = parseInt(window.getComputedStyle(sidebar).left);

        // If sidebar is visible and clicked outside of sidebar and menu button
        if (sidebarLeft >= -10 && !sidebar.contains(event.target) && !menuButton.contains(event.target)) {
            sidebar.style.left = "-110%"; // Hide the sidebar
        }
    }
});











    
    
}

main();
=======
// ✅ Full Spotify-Style Music Player Script.js (All essential functions and behaviors)

let songs = [];
let currfolder = "";
let currentSong = new Audio();
let isShuffle = false;
let isRepeat = false;

function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`;
}

function updateUI(track) {
    const cleanName = decodeURIComponent(track).replace(".mp3", "").replace(".m4a", "");
    document.querySelector(".Info").innerHTML = cleanName;
}

function saveLastPlayed(track) {
    localStorage.setItem("lastSong", track);
    localStorage.setItem("lastFolder", currfolder);
}

async function getsongs(folder) {
    currfolder = folder;
    let res = await fetch(`/${folder}`);
    let html = await res.text();
    let div = document.createElement("div");
    div.innerHTML = html;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let a of as) {
        if (a.href.endsWith(".mp3") || a.href.endsWith(".m4a")) {
            songs.push(a.href.split(`/${folder}/`)[1]);
        }
    }

    let ul = document.querySelector(".PlaylistSongs ul");
    ul.innerHTML = "";
    for (let song of songs) {
        let cleanName = decodeURIComponent(song).replace(".mp3", "").replace(".m4a", "");
        let li = document.createElement("li");
        li.className = "flex justify-between items-center px-2 hover:bg-[#1f1f1f] duration-300 cursor-pointer";
        li.innerHTML = `
            <span class="w-[80%] text-[13px]">${cleanName}</span>
            <div class="playImg h-7 w-7 bg-white rounded-full p-1 flex justify-center items-center">
                <img height="24px" width="24px" src="play.svg" alt="">
            </div>
        `;
        li.addEventListener("click", () => {
            playMusic(song)
            document.getElementById("Hrz").src = "pause.svg";
        });
        ul.appendChild(li);
    }
    return songs;
}

function playMusic(track) {
    currentSong.src = `/${currfolder}/` + track;
    currentSong.play();
    if (currentSong.paused) {
        document.getElementById("Hrz").src = "play.svg";
    }
    else {
        document.getElementById("Hrz").src = "pause.svg";
    }

    updateUI(track);
    saveLastPlayed(track);

    currentSong.ontimeupdate = () => {
        document.querySelector(".goingTime").innerText = formatTime(currentSong.currentTime);
        document.querySelector(".time").innerText = formatTime(currentSong.duration);

        const percent = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".seekcircle").style.left = `${percent}%`;
        document.querySelector(".progress").style.width = `${percent}%`;
    };

    currentSong.onended = () => {
        if (isRepeat) {
            playMusic(track);
        } else if (isShuffle) {
            const randomIndex = Math.floor(Math.random() * songs.length);
            playMusic(songs[randomIndex]);
        } else {
            let index = songs.indexOf(track);
            if (index < songs.length - 1) {
                playMusic(songs[index + 1]);
            } else {
                document.getElementById("Hrz").src = "play.svg";
            }
        }
    };
}

async function displayAlbums() {
    let res = await fetch("/songs/");
    let html = await res.text();
    let div = document.createElement("div");
    div.innerHTML = html;
    let links = div.getElementsByTagName("a");
    let container = document.querySelector(".maincontainer");
    container.innerHTML = "";

    for (let link of links) {
        if (link.href.includes("songs/")) {
            let folder = link.href.split("/").slice(-2)[1];
            let res = await fetch(`/songs/${folder}/info.json`);
            let info = await res.json();

            let card = document.createElement("div");
            card.className = "cardContainer hover:bg-[#1d1d1d] rounded-[10px] h-fit w-[18%] p-3 max-[800px]:w-full max-[800px]:justify-center";
            card.setAttribute("data-folder", folder);
            card.innerHTML = `
                <img src="/songs/${folder}/cover.jpg" alt="">
                <div class="HoverPlay hidden hover:scale-105 p-1.5">
                    <svg viewBox="0 0 24 24"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>
                </div>
                <h2 class="folName font-bold text-[16px] m-0.5 my-2">${info.title}</h2>
                <p class="text-gray-500 text-sm m-0.5 my-2">${info.discription}</p>
            `;
            card.addEventListener("click", async () => {
                songs = await getsongs(`songs/${folder}`);
                playMusic(songs[0]);
            });
            container.appendChild(card);
        }
    }
}

function bindControls() {
    document.getElementById("Play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById("Hrz").src = "pause.svg";
        } else {
            currentSong.pause();
            document.getElementById("Hrz").src = "play.svg";
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`/${currfolder}/`)[1]);
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    document.getElementById("previous").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`/${currfolder}/`)[1]);
        if (index > 0) playMusic(songs[index - 1]);
    });



    document.querySelector(".volume").addEventListener("click", () => {
        let vol = document.querySelector(".volimg");
        if (currentSong.volume > 0) {
            vol.src = "mute.svg";
            currentSong.volume = 0;
            document.querySelector(".rage input").value = 0;

            const volumeSlider = document.getElementById("volumeSlider");
            const audio = currentSong; // or your audio element

            function updateVolumeUI(value) {
                const percent = value;
                volumeSlider.style.background = `linear-gradient(to right, #1ed760 ${percent}%, #2d2d2d ${percent}%)`;
                audio.volume = percent / 100;

            }

            volumeSlider.addEventListener("input", (e) => {
        updateVolumeUI(e.target.value);
    });


    // ✅ Set initial style
    updateVolumeUI(volumeSlider.value);



        } 
        
        
        else {
            vol.src = "volume.svg";
            currentSong.volume = 1;
            document.querySelector(".rage input").value = 100;

            const volumeSlider = document.getElementById("volumeSlider");
            const audio = currentSong; // or your audio element

            function updateVolumeUI(value) {
                const percent = value;
                volumeSlider.style.background = `linear-gradient(to right, #1ed760 ${percent}%, #2d2d2d ${percent}%)`;
                audio.volume = percent / 100;

            }

            volumeSlider.addEventListener("input", (e) => {
        updateVolumeUI(e.target.value);
    });


    // ✅ Set initial style
    updateVolumeUI(volumeSlider.value);
        }
    });

    document.querySelector(".rage input").addEventListener("input", (e) => {
        currentSong.volume = e.target.value / 100;
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let bar = e.currentTarget.getBoundingClientRect();
        let percent = (e.clientX - bar.left) / bar.width;
        currentSong.currentTime = percent * currentSong.duration;
    });


}

async function main() {
    const lastFolder = localStorage.getItem("lastFolder");
    const lastSong = localStorage.getItem("lastSong");

    if (lastFolder && lastSong) {
        songs = await getsongs(lastFolder);
        playMusic(lastSong);
    } else {
        songs = await getsongs("songs/My_playlist");
        playMusic(songs[0]);
    }

    await displayAlbums();
    bindControls();

    document.addEventListener('keydown', function (e) {
        if (e.code === 'Space') {
            if (currentSong.paused) {
                currentSong.play()
                document.getElementById("Hrz").src = "pause.svg"
            }

            else {
                currentSong.pause()
                document.getElementById("Hrz").src = "play.svg"
            }
        }
    })

    const volumeSlider = document.getElementById("volumeSlider");
    const audio = currentSong; // or your audio element

    function updateVolumeUI(value) {
        const percent = value;
        volumeSlider.style.background = `linear-gradient(to right, #1ed760 ${percent}%, #2d2d2d ${percent}%)`;
        audio.volume = percent / 100;

        console.log(volumeSlider.value)
    }

    // 🔁 On input (dragging)
    volumeSlider.addEventListener("input", (e) => {
        updateVolumeUI(e.target.value);
    });


    // ✅ Set initial style
    updateVolumeUI(volumeSlider.value);


    // event to close playlist
    document.getElementById("closeHam").addEventListener("click", () => {
        let clsleft = document.querySelector(".left");
        clsleft.style.left = "-110%"
    })

    document.querySelector(".menu").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })










    document.addEventListener("click", function (event) {
    const sidebar = document.querySelector(".left");
    const menuButton = document.querySelector(".menu");

    // Only apply on mobile (max-width: 1100px)
    if (window.innerWidth <= 1100) {
        // Check if the sidebar is visible (left: 0px or near it)
        const sidebarLeft = parseInt(window.getComputedStyle(sidebar).left);

        // If sidebar is visible and clicked outside of sidebar and menu button
        if (sidebarLeft >= -10 && !sidebar.contains(event.target) && !menuButton.contains(event.target)) {
            sidebar.style.left = "-110%"; // Hide the sidebar
        }
    }
});











    
    
}

main();
>>>>>>> 9bfd6a97316f0f2370eba894edd9368929cd39fb
