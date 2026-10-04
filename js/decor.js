/* ============================================================
   ДЕКОР — КОШКА НА РАМКЕ
   ============================================================ */
function renderCatDecor(){
    return `
       <div class="decor-cat" onclick="catJumpscare()" style="pointer-events: auto !important; cursor: pointer;">
            <svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="45" cy="30" rx="26" ry="14" fill="#8a5a3a"/>
                <ellipse cx="45" cy="32" rx="26" ry="14" fill="#a87050"/>

                <path d="M 30 25 Q 45 22 60 25" stroke="#6a4020" stroke-width="2" fill="none" opacity="0.6"/>
                <path d="M 28 32 Q 45 30 62 32" stroke="#6a4020" stroke-width="2" fill="none" opacity="0.6"/>
                <path d="M 30 38 Q 45 36 60 38" stroke="#6a4020" stroke-width="2" fill="none" opacity="0.6"/>

                <path class="cat-tail" d="M 68 32 Q 82 28 84 40 Q 85 48 78 50"
                      stroke="#8a5a3a" stroke-width="5" fill="none" stroke-linecap="round"/>
                <path class="cat-tail" d="M 68 32 Q 82 28 84 40 Q 85 48 78 50"
                      stroke="#a87050" stroke-width="3" fill="none" stroke-linecap="round"/>

                <g class="cat-paw-front">
                    <ellipse cx="35" cy="46" rx="4" ry="7" fill="#a87050"/>
                    <circle cx="35" cy="52" r="3" fill="#f5dcc0"/>
                    <circle cx="34" cy="51" r="0.8" fill="#8a5a3a"/>
                    <circle cx="35" cy="51" r="0.8" fill="#8a5a3a"/>
                    <circle cx="36" cy="51" r="0.8" fill="#8a5a3a"/>
                </g>

                <g class="cat-paw-back">
                    <ellipse cx="58" cy="46" rx="4" ry="7" fill="#a87050"/>
                    <circle cx="58" cy="52" r="3" fill="#f5dcc0"/>
                </g>

                <ellipse cx="28" cy="24" rx="13" ry="12" fill="#a87050"/>

                <path d="M 18 15 L 16 4 L 24 12 Z" fill="#8a5a3a"/>
                <path d="M 19 14 L 17 7 L 22 12 Z" fill="#f5a8a0"/>
                <path d="M 36 15 L 40 4 L 42 14 Z" fill="#8a5a3a"/>
                <path d="M 37 14 L 40 8 L 41 13 Z" fill="#f5a8a0"/>

                <ellipse cx="24" cy="26" rx="4" ry="3" fill="#f5dcc0"/>
                <ellipse cx="32" cy="26" rx="4" ry="3" fill="#f5dcc0"/>

                <ellipse class="cat-eye" cx="23" cy="22" rx="2" ry="3" fill="#2a1a0a"/>
                <ellipse class="cat-eye" cx="33" cy="22" rx="2" ry="3" fill="#2a1a0a"/>

                <path d="M 27 26 L 29 26 L 28 27 Z" fill="#d97a7a"/>
                <path d="M 28 27 Q 26 29 25 28" stroke="#2a1a0a" stroke-width="0.6" fill="none"/>
                <path d="M 28 27 Q 30 29 31 28" stroke="#2a1a0a" stroke-width="0.6" fill="none"/>

                <line x1="10" y1="24" x2="20" y2="25" stroke="#2a1a0a" stroke-width="0.5" opacity="0.6"/>
                <line x1="10" y1="27" x2="20" y2="27" stroke="#2a1a0a" stroke-width="0.5" opacity="0.6"/>
                <line x1="36" y1="25" x2="46" y2="24" stroke="#2a1a0a" stroke-width="0.5" opacity="0.6"/>
                <line x1="36" y1="27" x2="46" y2="27" stroke="#2a1a0a" stroke-width="0.5" opacity="0.6"/>
            </svg>
        </div>
    `;
}

/* ============================================================
   ДЕКОР — КРОВЬ
   ============================================================ */
function renderBloodDecor(){
    let splatters = '';
    for (let i = 0; i < 12; i++){
        const size = 4 + Math.random() * 14;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = (Math.random() * 0.3).toFixed(2);
        splatters += `<div class="blood-splatter" style="
            left: ${left}%;
            top: ${top}%;
            width: ${size}px;
            height: ${size}px;
            animation-delay: ${delay}s;
        "></div>`;
    }

    let drips = '';
    const dripPositions = [12, 28, 45, 62, 78, 90];
    dripPositions.forEach((pos, i) => {
        const length = 60 + Math.random() * 120;
        const width = 3 + Math.random() * 3;
        const delay = (i * 0.15).toFixed(2);
        drips += `<div class="blood-drip" style="
            left: ${pos}%;
            width: ${width}px;
            --drip-length: ${length}px;
            animation-delay: ${delay}s;
        "></div>`;
    });

    let puddles = '';
    const puddlePositions = [25, 70];
    puddlePositions.forEach((pos, i) => {
        const w = 40 + Math.random() * 30;
        const h = 12 + Math.random() * 8;
        const delay = (i * 0.3 + 0.4).toFixed(2);
        puddles += `<div class="blood-puddle" style="
            left: ${pos}%;
            width: ${w}px;
            height: ${h}px;
            animation-delay: ${delay}s;
        "></div>`;
    });

    let smears = '';
    const smearPositions = [
        { left: 10, top: 40, w: 80, rot: -15 },
        { left: 55, top: 55, w: 100, rot: 10 }
    ];
    smearPositions.forEach((s, i) => {
        const delay = (i * 0.2 + 0.2).toFixed(2);
        smears += `<div class="blood-smear" style="
            left: ${s.left}%;
            top: ${s.top}%;
            width: ${s.w}px;
            height: 6px;
            transform: rotate(${s.rot}deg);
            animation-delay: ${delay}s;
        "></div>`;
    });

    return `
        <div class="decor-blood">
            ${splatters}
            ${drips}
            ${puddles}
            ${smears}
        </div>
    `;
}

/* ============================================================
   ДЕКОР — ДОЖДЬ
   ============================================================ */
function generateRaindrops(){
    const bg = document.getElementById('rainBg');
    if (!bg) return;
    if (bg.dataset.ready === '1') return;
    bg.innerHTML = '';

    for (let i = 0; i < 20; i++){
        const drop = document.createElement('div');
        drop.className = 'raindrop';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.animationDuration = (0.7 + Math.random() * 0.5) + 's';
        drop.style.animationDelay = (Math.random() * 1.5) + 's';
        bg.appendChild(drop);
    }

    for (let i = 0; i < 12; i++){
        const drop = document.createElement('div');
        drop.className = 'raindrop big';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.animationDuration = (1.4 + Math.random() * 0.8) + 's';
        drop.style.animationDelay = (Math.random() * 2) + 's';
        bg.appendChild(drop);
    }

    for (let i = 0; i < 20; i++){
        const drop = document.createElement('div');
        drop.className = 'raindrop small';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.animationDuration = (0.9 + Math.random() * 0.4) + 's';
        drop.style.animationDelay = (Math.random() * 1.5) + 's';
        bg.appendChild(drop);
    }

    const glass = document.createElement('div');
    glass.className = 'rain-glass';
    bg.appendChild(glass);

    const fog = document.createElement('div');
    fog.className = 'rain-fog';
    bg.appendChild(fog);

    bg.dataset.ready = '1';
}

/* ============================================================
   ДЕКОР — ДИСКОТЕКА
   ============================================================ */
function generateDiscoLights(){
    const bg = document.getElementById('discoBg');
    if (!bg) return;
    bg.innerHTML = '';

    const colors = ['pink', 'blue', 'purple', 'yellow', 'green'];
    colors.forEach((color, i) => {
        const light = document.createElement('div');
        light.className = 'disco-light ' + color;
        light.style.left = (10 + i * 15) + '%';
        light.style.top = (20 + (i % 3) * 20) + '%';
        light.style.animationDelay = (i * 0.4) + 's';
        bg.appendChild(light);
    });

    const beam = document.createElement('div');
    beam.className = 'disco-beam';
    bg.appendChild(beam);

    for (let i = 0; i < 30; i++){
        const spark = document.createElement('div');
        spark.className = 'disco-spark';
        spark.style.left = Math.random() * 100 + '%';
        spark.style.top = Math.random() * 100 + '%';
        spark.style.animationDelay = Math.random() * 2 + 's';
        spark.style.animationDuration = (1 + Math.random() * 1.5) + 's';
        bg.appendChild(spark);
    }
}

/* ============================================================
   ДЕКОР — ТУМАН
   ============================================================ */
function generateFog(){
    const bg = document.getElementById('fogBg');
    if (!bg) return;
    if (bg.dataset.ready === '1') return;
    bg.innerHTML = '';

    for (let i = 0; i < 4; i++){
        const layer = document.createElement('div');
        layer.className = 'fog-layer';
        bg.appendChild(layer);
    }

    bg.dataset.ready = '1';
}

/* ============================================================
   ДЕКОР — ФОНАРИ
   ============================================================ */
function generateLamps(){
    const bg = document.getElementById('lampsBg');
    if (!bg) return;
    if (bg.dataset.ready === '1') return;
    bg.innerHTML = '';

    for (let i = 0; i < 5; i++){
        const lamp = document.createElement('div');
        lamp.className = 'lamp';
        bg.appendChild(lamp);
    }

    bg.dataset.ready = '1';
}

/* ============================================================
   ДЕКОР ФОНА — ЗВЁЗДЫ
   ============================================================ */
function generateStars(){
    const bg = document.getElementById('starsBg');
    if (!bg) return;

    for (let i = 0; i < 90; i++){
        const star = document.createElement('div');
        star.className = 'star' + (Math.random() < 0.2 ? ' big' : '');
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDuration = (2 + Math.random() * 5) + 's';
        star.style.animationDelay = Math.random() * 4 + 's';
        star.style.opacity = 0.3 + Math.random() * 0.7;
        bg.appendChild(star);
    }
}

/* ============================================================
   ДЕКОР ФОНА — ЛИСТЬЯ И ПЫЛИНКИ
   ============================================================ */
function generateFgDecor(){
    const fg = document.getElementById('fgDecor');
    if (!fg) return;

    // 30 листьев
    for (let i = 0; i < 30; i++){
        const leaf = document.createElement('div');
        leaf.className = 'leaf';
        fg.appendChild(leaf);
    }
}

/* ============================================================
   ПИКСЕЛЬ-ТОЧКИ НА ФОНЕ
   ============================================================ */
function generateBgDots(){
    const bg = document.getElementById('bgDots');
    if (!bg) return;
    if (bg.dataset.ready === '1') return;
    bg.innerHTML = '';

    for (let i = 0; i < 12; i++){
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.left = Math.random() * 100 + '%';
        dot.style.top = (60 + Math.random() * 40) + '%';
        dot.style.animationDuration = (12 + Math.random() * 8) + 's';
        dot.style.animationDelay = (Math.random() * 8) + 's';
        bg.appendChild(dot);
    }

    bg.dataset.ready = '1';
}

/* ============================================================
   СКРИМЕР — кошачье лицо
   ============================================================ */
function catJumpscare(){
    // Кулдаун 2 минуты (120 000 мс)
    const lastScare = localStorage.getItem('cat_scare_time');
    const now = Date.now();

    if (lastScare && (now - parseInt(lastScare)) < 120000){
        // Ещё рано — не показываем
        return;
    }

    // Отмечаем время
    localStorage.setItem('cat_scare_time', now.toString());

    // 1. Запускаем хоррор-режим (серый экран, всё замирает)
    document.body.classList.add('horror-mode');

    // 2. Звук — крик кошки
    playCatScream();

    // 3. Через 2 секунды — скример
    setTimeout(() => {
        const jumpscare = document.getElementById('catJumpscare');
        const face = document.getElementById('catFace');
        const flash = document.getElementById('catFlash');

        if (!jumpscare) return;

        // Показываем лицо
        jumpscare.classList.add('active');
        face.classList.add('shake');

        // Вспышка
        if (flash){
            flash.classList.add('active');
            setTimeout(() => flash.classList.remove('active'), 500);
        }

        // 4. Через 1.5 сек — убираем скример
        setTimeout(() => {
            jumpscare.classList.remove('active');
            face.classList.remove('shake');

            // 5. Через 0.5 сек — выходим из хоррор-режима
            setTimeout(() => {
                document.body.classList.remove('horror-mode');
            }, 500);

        }, 1500);
    }, 2000);
}

/* ============================================================
   ЗВУК СКРИМЕРА
   ============================================================ */
function playCatScream(){
    try {
        const audio = new Audio('assets/sounds/cat-scream.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => {
            // Если браузер не разрешил — тихо молчим
            console.log('Звук не воспроизведён:', e);
        });
    } catch(e){
        console.log('Ошибка звука:', e);
    }
}

function playCatScream(){
    try {
        const audio = new Audio('assets/sounds/cat-scream.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
    } catch(e){}
}