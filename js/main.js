document.addEventListener('DOMContentLoaded', () => {
    class appView {
        constructor(app) {
            this.app = app;
            this.vynil = null;
            this.audio = new Audio();
            this.songName = null;
            this.audioTime = 0;
            this.idVynInterval = null;
            this.btnStart = null;
        }
        printPlaylist(songs) {
            let songsList = document.createElement('ul');
                songsList.classList.add('song-list');

            for(let i = 0; i < songs.length; i++) {
                let li = document.createElement('li');
                li.classList.add('song');
                li.setAttribute('draggable', 'true');

                li.innerHTML = songs[i];
                songsList.appendChild(li);
                this.app.querySelector('#playlist').appendChild(songsList);
            }
            this.btnStart = this.app.querySelector('#startButton');
            this.btnStart.disabled = true;
            this.vynil = this.app.querySelector('.vynil');
        }

        dropOutElementStyle(event) {

            if(event.type === 'dragstart') {
                event.target.classList.add('dragging');
            }
            if(event.type === 'dragleave') {
                event.target.classList.remove('dragging');
            }
            if(event.type === 'dragover') {
                console.log(event.type);
                this.vynil.style.opacity = '0.6'; 
            }

        }

        readyTonearmAndText(songName) {
            if(this.app.querySelector('.song-name')) {
                this.app.querySelector('.song-name').removeAttribute('style');   
            }                       

            this.songName = this.app.querySelector('.song-name');
            this.songName.innerHTML = songName;

            this.audio.src = `../Vynilizer/audio/${songName}.mp3`;

            if (songName.length < 40) {
                this.songName.style.top = '36.9%';
            }
            if (songName.length > 42) {
                this.songName.style.top = '34.8%';
            }
            if (this.songName) {
                new CircleType(this.songName);
            }
            this.vynil.style.opacity = '1';

            let tonearm = this.app.querySelector('.tonearm');
            tonearm.classList.add('rotate-tonearm');
            tonearm.style.transform = `rotate(15deg)`;

            this.audio.addEventListener('loadedmetadata', () => {
                this.app.querySelector('#seek').setAttribute('max', `${this.audio.duration}`);
            });
            this.btnStart.disabled = false;
        }

        driveVynil() {
            let angle = 0;
            this.idVynInterval = setInterval(() => {
                angle += 10;
                this.vynil.style.transform = `rotate(${angle}deg)`;
                this.app.querySelector('.song-name').style.transform = `rotate(${angle}deg)`;
            }, 60);
        }
        startVynilAudio() {
            this.vynil.style.opacity = '1'; 
            
            if(this.audio.paused) {
                if(this.audio.currentTime === 0) {
                    let noise = new Audio('../Vynilizer/audio/noise.mp3');
                    this.driveVynil();
                    noise.play();
                    this.btnStart.disabled = true;
                    setTimeout(() => {
                        noise.pause();
                        this.btnStart.disabled = false;
                        
                        this.audio.play();
                        this.audioTime = this.audio.duration;
                        this.app.querySelector('#seek').classList.add('show');
                    }, 4000);
                } else {
                    this.driveVynil();
                    this.audio.play();
                    this.audioTime = this.audio.duration;
                    this.app.querySelector('#seek').classList.add('show');
                }
                
            } else {
                this.audio.pause();
                clearInterval(this.idVynInterval);
                this.vynil.style.opacity = '0.8';
                this.app.querySelector('#seek').classList.remove('show');
            }
        }

        printAudioTimer() {                    // Таймер
            
            this.audio.addEventListener('timeupdate', () => {
                let minutes = parseInt((this.audio.currentTime / 60) % 60);
                let seconds = parseInt(this.audio.currentTime % 60);
                let ms = ((this.audio.currentTime * 1000) % 1000).toFixed(0);

                let angle = +((this.audio.currentTime / 18).toFixed(2)),
                grad = 0;

                if (seconds < 10) {
                    this.app.querySelector('.song-timer').textContent = minutes + ':0' + seconds + ':0' + ms;
                }
                else {
                    this.app.querySelector('.song-timer').textContent = minutes + ':' + seconds + ':0' + ms;
                }

                grad += angle;
                this.app.querySelector('.tonearm').style.transform = `rotate(${15 + grad}deg)`;

                if(this.audio.currentTime === this.audioTime) {
                    clearInterval(this.idVynInterval);
                }
            });
            this.app.querySelector('.tonearm').classList.add('trans');
        }

        volumeNormalization(volume) {
            this.audio.volume = volume;
        }

        showSeekin(value) {
            this.audio.currentTime = value;
        }

    }


    class appModel {
        constructor(view) {
            this.view = view;
            this.songs = ['Red Hot Chili Peppers - Californication', 'Smolik(feat Gaba Kulka) - SOS Songs', 'The Mamas And The Papas - California Dreamin'];
        }
        init() {
            this.view.printPlaylist(this.songs);
        }

        dropElementDataStyle(event) {
            if(event.type === 'dragstart') {
                event.dataTransfer.setData('text', event.target.textContent);
                this.view.dropOutElementStyle(event);
                console.log(event);

            }
            if(event.type === 'dragleave') {
                console.log(event.type);
                this.view.dropOutElementStyle(event);
            }
            if(event.type === 'dragover') {
                this.view.dropOutElementStyle(event);
            }
        }
        volumeTransfer(volume) {
            this.view.volumeNormalization(volume);
        }

        readyStartPlaying(event) {
            if(event.target.textContent) {
                this.view.readyTonearmAndText(event.target.textContent);
            }
            else {
                let dataText = event.dataTransfer.getData('text');
                this.view.readyTonearmAndText(dataText);
            }
        }

        playAndStopMusic() {
            this.view.startVynilAudio();
            this.view.printAudioTimer();
        }

        changeDuration(value) {
            this.view.showSeekin(value);
        }

    }



    class appController {
        constructor(app) {
            this.app = app;
            this.counter = 0;
            this.volumeSlider = null;
            this.seekSlider = null;
        }

        init() {
            this.app.querySelector('#startButton').addEventListener('click', this.playReaction);
            this.app.querySelector('#playlist').addEventListener('mouseover', event => {
                let target = event.target;
                if(target.tagName === 'LI') { 
                    target.addEventListener('dblclick', this.takeSongFromList);
                    target.addEventListener('dragstart', this.dragStart);
                    target.addEventListener('dragleave', this.dragLeave);
                }
            });
            this.app.querySelector('.vynil').addEventListener('dragover', this.dragOver);
            this.app.querySelector('.vynil').addEventListener('drop', this.drop);
            this.volumeSlider = this.app.querySelector('.slider');
            this.volumeSlider.addEventListener('change', this.volumeChange.bind(this));
            this.seekSlider = this.app.querySelector('#seek');
            this.seekSlider.addEventListener('change', this.changeAudioTime.bind(this));
        }

        playReaction() {
            model.playAndStopMusic();
        }

        takeSongFromList(event) {
            model.readyStartPlaying(event);
        }

        dragStart(event) {
            model.dropElementDataStyle(event);
        }

        dragLeave(event) {
            model.dropElementDataStyle(event);
        }

        dragOver(event) {
            event.preventDefault();
            model.dropElementDataStyle(event);
        }

        drop(event) {
            event.preventDefault();
            model.readyStartPlaying(event);
        }

        volumeChange() {
            model.volumeTransfer(this.volumeSlider.value);
        }

        changeAudioTime() {
            model.changeDuration(this.seekSlider.value);
        }
    }

    let app = document.getElementById('app');

    const view = new appView(app),
    model = new appModel(view),
    controller = new appController(app);


    model.init();
    controller.init();

});