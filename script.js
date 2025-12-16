const audio = document.getElementById("audio");
const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const list = document.getElementById("songList");
const lyricsBox = document.getElementById("lyricsBox");

let index=0,isPlaying=false,shuffle=false,repeat=0;

// render list
playlist.forEach((s,i)=>{
  const li=document.createElement("li");
  li.textContent=s.title;
  li.onclick=()=>loadSong(i,true);
  list.appendChild(li);
});

function highlight(){
  [...list.children].forEach((li,i)=>li.classList.toggle("active",i===index));
}

async function loadLRC(url){
  lyricsBox.innerHTML="Loading lyrics...";
  const text=await (await fetch(url)).text();
  lyricsBox.innerHTML="";
  text.split("\n").forEach(l=>{
    const m=l.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if(m){
      const div=document.createElement("div");
      div.className="lyrics-line";
      div.dataset.time=parseInt(m[1])*60+parseFloat(m[2]);
      div.textContent=m[3];
      lyricsBox.appendChild(div);
    }
  });
}

function loadSong(i,play=false){
  index=i;
  const s=playlist[i];
  audio.src=s.src;
  cover.src=s.cover;
  title.textContent=s.title;
  artist.textContent=s.artist;
  document.querySelector(".player").style.background=
    `linear-gradient(180deg,${s.gradient[0]},${s.gradient[1]})`;
  if(s.lrc) loadLRC(s.lrc);
  highlight();
  if(play){audio.play();isPlaying=true}
}

function playPause(){
  if(!audio.src) loadSong(0,true);
  else if(isPlaying){audio.pause();isPlaying=false}
  else{audio.play();isPlaying=true}
}

function next(){
  if(shuffle){
    let n;
    do{n=Math.floor(Math.random()*playlist.length)}while(n===index);
    loadSong(n,true);
  }else loadSong((index+1)%playlist.length,true);
}
function prev(){loadSong((index-1+playlist.length)%playlist.length,true)}

function toggleShuffle(){
  shuffle=!shuffle;
  document.getElementById("shuffle").classList.toggle("active",shuffle);
}

function toggleRepeat(){
  repeat=(repeat+1)%3;
  document.getElementById("repeat").textContent=repeat===1?"🔂":"🔁";
}

audio.ontimeupdate=()=>{
  progress.value=(audio.currentTime/audio.duration)*100||0;
  document.querySelectorAll(".lyrics-line").forEach((l,i,arr)=>{
    const t=parseFloat(l.dataset.time);
    const n=arr[i+1]?.dataset.time||9999;
    if(audio.currentTime>=t&&audio.currentTime<n){
      l.classList.add("active");
      l.scrollIntoView({block:"center",behavior:"smooth"});
    }else l.classList.remove("active");
  });
};

audio.onended=()=>{
  if(repeat===1){audio.currentTime=0;audio.play()}
  else if(repeat===2) next();
};

progress.oninput=()=>audio.currentTime=(progress.value/100)*audio.duration;
volume.oninput=()=>audio.volume=volume.value;

function shareSong(){
  const s=playlist[index];
  const text=`🎧 ${s.title} - ${s.artist}\n${location.href}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}

// save last song
audio.onpause=()=>localStorage.setItem("last",JSON.stringify([index,audio.currentTime]));
window.onload=()=>{
  const last=JSON.parse(localStorage.getItem("last")||"[]");
  if(last.length){loadSong(last[0]);audio.currentTime=last[1]}
};

// animated canvas
const c=document.getElementById("bgCanvas"),ctx=c.getContext("2d");
function resize(){c.width=innerWidth;c.height=innerHeight}
resize();onresize=resize;
let t=0;
(function anim(){
  t+=.3;
  ctx.fillStyle=`hsl(${t%360},60%,8%)`;
  ctx.fillRect(0,0,c.width,c.height);
  requestAnimationFrame(anim);
})();
