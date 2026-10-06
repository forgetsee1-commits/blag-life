'use strict';

/* ============================================================
   АУДИО-МОДУЛЬ v2
   Управляет фоновой музыкой, нефорской, тиктоком и громкостью.
   Фон плавно затухает при других треках и возобновляется.
   ============================================================ */

const AUDIO_FILES = {
    bg:     'assets/sounds/day2-bg.mp3',
    neform: 'assets/sounds/neform.mp3',
    tiktok: 'assets/sounds/tiktok.mp3',
    scream: 'assets/sounds/cat-scream.mp3'
};

let bgAudio = null;
let neformAudio = null;
let tiktokAudio = null;
let screamAudio = null;

let globalVolume = 0.5;
let bgFadeTimer = null;
let bgTargetVolume = 0;
let bgCurrentVolume = 0;

const BG_FADE_DURATION = 2000;
const BG_FADE_STEP = 50;
const BG_BASE_VOLUME = 0.4;

/* ============================================================
   ГРОМКОСТЬ
   ============================================================ */
function loadVolume(){
    try {
        const v = localStorage.getItem('blag_volume');
        if (v !== null){
            globalVolume = Math.max(0, Math.min(1, parseFloat(v)));
        }
    } catch(e){}
    updateVolumeSlider();
    applyVolumeToAll();
}

function saveVolume(){
    try {
        localStorage.setItem('blag_volume', String(globalVolume));
    } catch(e){}
}

function setGlobalVolume(v){
    globalVolume = Math.max(0, Math.min(1, v));
    saveVolume();
    updateVolumeSlider();
    applyVolumeToAll();
}

function updateVolumeSlider(){
    const slider = document.getElementById('volumeSlider');
    const icon = document.getElementById('volumeIcon');
    if (slider) slider.value = Math.round(globalVolume * 100);
    if (icon){
        if (globalVolume === 0) icon.textContent = '🔇';
        else if (globalVolume < 0.4) icon.textContent = '🔈';
        else if (globalVolume < 0.7) icon.textContent = '🔉';
        else icon.textContent = '🔊';
    }
}

function applyVolumeToAll(){
    if (bgAudio) bgAudio.volume = bgCurrentVolume * globalVolume;
    if (neformAudio) neformAudio.volume = 0.5 * globalVolume;
    if (tiktokAudio) tiktokAudio.volume = 0.6 * globalVolume;
    if (screamAudio) screamAudio.volume = 0.5 * globalVolume;
}

function initVolumeControl(){
    const slider = document.getElementById('volumeSlider');
    if (!slider) {
        console.warn('Ползунок громкости не найден в HTML');
        return;
    }

    loadVolume();

    slider.addEventListener('input', (e) => {
        const v = parseInt(e.target.value, 10) / 100;
        setGlobalVolume(v);
    });

    // На всякий случай — change тоже
    slider.addEventListener('change', (e) => {
        const v = parseInt(e.target.value, 10) / 100;
        setGlobalVolume(v);
    });
}

/* ============================================================
   ФОНОВАЯ МУЗЫКА
   ============================================================ */
function playBgMusic(){
    if (bgAudio){
        // Уже есть — просто возвращаем громкость
        const p = bgAudio.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
        fadeBgTo(BG_BASE_VOLUME, 800);
        return;
    }

    try {
        bgAudio = new Audio(AUDIO_FILES.bg);
        bgAudio.loop = false;
        bgAudio.volume = 0;
        bgAudio.preload = 'auto';

        // Когда трек закончился — плавно заводим заново
        bgAudio.addEventListener('ended', () => {
            if (!bgAudio) return;
            try {
                bgAudio.currentTime = 0;
                bgAudio.volume = 0;
                bgCurrentVolume = 0;
                const p = bgAudio.play();
                if (p && typeof p.catch === 'function') p.catch(() => {});
                fadeBgTo(BG_BASE_VOLUME, BG_FADE_DURATION);
            } catch(e){}
        });

        const p = bgAudio.play();
        if (p && typeof p.catch === 'function'){
            p.catch((e) => {
                console.warn('Фоновая музыка не запустилась:', e && e.name);
            });
        }

        bgCurrentVolume = 0;
        fadeBgTo(BG_BASE_VOLUME, BG_FADE_DURATION);
    } catch(e){
        console.warn('Ошибка фоновой музыки:', e);
    }
}

function fadeBgTo(target, duration, onDone){
    if (bgFadeTimer) clearInterval(bgFadeTimer);
    bgTargetVolume = target;

    const steps = Math.max(1, Math.floor(duration / BG_FADE_STEP));
    const delta = (target - bgCurrentVolume) / steps;

    let step = 0;
    bgFadeTimer = setInterval(() => {
        step++;
        bgCurrentVolume += delta;

        if (bgCurrentVolume < 0) bgCurrentVolume = 0;
        if (bgCurrentVolume > 1) bgCurrentVolume = 1;

        if (bgAudio) bgAudio.volume = bgCurrentVolume * globalVolume;

        if (step >= steps){
            clearInterval(bgFadeTimer);
            bgFadeTimer = null;
            bgCurrentVolume = target;
            if (bgAudio) bgAudio.volume = bgCurrentVolume * globalVolume;
            if (typeof onDone === 'function') onDone();
        }
    }, BG_FADE_STEP);
}

function stopBgMusic(){
    if (!bgAudio) return;

    if (bgFadeTimer) clearInterval(bgFadeTimer);

    const steps = 30;
    const delta = bgCurrentVolume / steps;

    let step = 0;
    bgFadeTimer = setInterval(() => {
        step++;
        bgCurrentVolume -= delta;
        if (bgCurrentVolume < 0) bgCurrentVolume = 0;

        if (bgAudio) bgAudio.volume = bgCurrentVolume * globalVolume;

        if (step >= steps){
            clearInterval(bgFadeTimer);
            bgFadeTimer = null;
            try { bgAudio.pause(); } catch(e){}
            bgAudio = null;
            bgCurrentVolume = 0;
        }
    }, 30);
}

function pauseBgMusicForScream(){
    if (bgAudio) bgAudio.pause();
}

function resumeBgMusicAfterScream(){
    if (bgAudio){
        const p = bgAudio.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
    }
}

/* ============================================================
   НЕФОРСКАЯ МУЗЫКА (наушники)
   ============================================================ */
function playNeform(){
    if (neformAudio) return;

    // Плавно убираем фон, потом pause
    fadeBgTo(0, 500, () => {
        if (bgAudio){
            try { bgAudio.pause(); } catch(e){}
        }
    });

    try {
        neformAudio = new Audio(AUDIO_FILES.neform);
        neformAudio.loop = true;
        neformAudio.volume = 0.5 * globalVolume;
        neformAudio.preload = 'auto';

        const p = neformAudio.play();
        if (p && typeof p.catch === 'function'){
            p.catch((e) => {
                console.warn('Нефорская не запустилась:', e && e.name);
            });
        }
    } catch(e){
        console.warn('Ошибка нефорской:', e);
    }
}

function stopNeform(){
    if (neformAudio){
        try { neformAudio.pause(); } catch(e){}
        neformAudio = null;
    }

    // Плавно возвращаем фон
    if (bgAudio){
        const p = bgAudio.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
        fadeBgTo(BG_BASE_VOLUME, 800);
    } else {
        playBgMusic();
    }
}

/* ============================================================
   ТИКТОК
   ============================================================ */
function playTiktok(){
    if (tiktokAudio) return;

    fadeBgTo(0, 400, () => {
        if (bgAudio){
            try { bgAudio.pause(); } catch(e){}
        }
    });

    try {
        tiktokAudio = new Audio(AUDIO_FILES.tiktok);
        tiktokAudio.loop = false;
        tiktokAudio.volume = 0.6 * globalVolume;
        tiktokAudio.preload = 'auto';

        const p = tiktokAudio.play();
        if (p && typeof p.catch === 'function'){
            p.catch((e) => {
                console.warn('Тикток не запустился:', e && e.name);
            });
        }

        tiktokAudio.addEventListener('ended', () => {
            tiktokAudio = null;

            // Возвращаем фон
            if (bgAudio){
                const p2 = bgAudio.play();
                if (p2 && typeof p2.catch === 'function') p2.catch(() => {});
                fadeBgTo(BG_BASE_VOLUME, 800);
            } else {
                playBgMusic();
            }
        });
    } catch(e){
        console.warn('Ошибка тиктока:', e);
    }
}

function stopTiktok(){
    if (tiktokAudio){
        try { tiktokAudio.pause(); } catch(e){}
        tiktokAudio = null;
    }

    // Возвращаем фон
    if (bgAudio){
        const p = bgAudio.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
        fadeBgTo(BG_BASE_VOLUME, 800);
    }
}

/* ============================================================
   СКРИМЕР — ОТДЕЛЬНО
   ============================================================ */
function playScreamSound(){
    try {
        if (screamAudio){
            try { screamAudio.pause(); } catch(e){}
            screamAudio = null;
        }
        screamAudio = new Audio(AUDIO_FILES.scream);
        screamAudio.volume = 0.5 * globalVolume;

        // На время скримера — стопаем фон
        pauseBgMusicForScream();

        const p = screamAudio.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});

        screamAudio.addEventListener('ended', () => {
            screamAudio = null;
            resumeBgMusicAfterScream();
        });

    } catch(e){}
}

/* ============================================================
   СТОП ВСЕГО
   ============================================================ */
function stopAllAudio(){
    stopBgMusic();
    stopNeform();
    stopTiktok();
}

/* ============================================================
   INIT
   ============================================================ */
if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initVolumeControl);
} else {
    initVolumeControl();
}