/* ============================================================
   АКТ 1 · 10 ЛЕТ
   Флаги: сюжетные в storyFlags (живут всю игру),
          дневные в dayFlags (сбрасываются nextDay)
   ============================================================ */

const act1Nodes = {

/* ============================================================
   ОБЩИЕ УЗЛЫ — main, act_select, referral, day_empty
   ============================================================ */

main: {
    emoji: '🌆',
    time: 'day',
    title: () => 'Возраст: ' + player.age + ' · День ' + player.day,
    text: () => 'Что будешь делать?',
    choices: () => {
        const list = [];

        if (player.age >= 11){
            list.push({ text: '📖 Выбор акта', next: 'act_select' });
        }

        const dayScene = getDayScene();
        if (dayScene){
            list.push({ text: dayScene.button, next: dayScene.scene });
        } else {
            list.push({ text: '📅 Прожить день', next: 'day_empty' });
        }

        if (player.openedSections.development){
            list.push({ text: '🌱 Развитие', next: 'development_menu' });
        }
        if (player.openedSections.sections){
            list.push({ text: '🏆 Секции', next: 'sections_menu' });
        }
        if (player.openedSections.relationships){
            list.push({ text: '💑 Отношения', next: 'relationships_menu' });
        }

        return list;
    }
},

act_select: {
    emoji: '📖',
    time: 'day',
    title: 'Выбор акта',
    text: () => 'Ты можешь начать любой акт заново. Прогресс текущего акта сбросится, но предыдущие останутся.',
    choices: () => {
        const list = [];

        list.push({
            text: '📖 Акт 1 — 10 лет' + (player.age === 10 ? ' ▶ Сейчас' : ' ✓'),
            action: () => startAct(1)
        });

        if (player.age >= 11){
            list.push({
                text: '📖 Акт 2 — 11 лет' + (player.age === 11 ? ' ▶ Сейчас' : ' ✓'),
                action: () => startAct(2)
            });
        } else {
            list.push({
                text: '🔒 Акт 2 — 11 лет',
                action: () => {
                    showToast('🔒','Закрыто','Сначала пройди акт 1.');
                    setTimeout(() => showScene('act_select'), 1500);
                }
            });
        }

        list.push({
            text: '🔒 Акт 3 — 12 лет',
            action: () => {
                showToast('🔒','Скоро','Акт 3 ещё не написан.');
                setTimeout(() => showScene('act_select'), 1500);
            }
        });

        list.push({ text: '↩️ Назад', next: 'main', style: 'back' });

        return list;
    }
},

day_empty: {
    emoji: '🌅',
    time: 'day',
    title: 'День прошёл',
    text: 'Ты просто прожил этот день. Ничего особенного.',
    choices: [
        { text: 'Дальше', action: () => { nextDay(); } }
    ]
},

referral: {
    emoji: '🔗',
    time: 'day',
    title: 'Пригласить друга',
    text: () => {
        const refs = player.referrals || 0;
        return `Ты пригласил: ${refs} друзей.\nБонус: ${refs * 500}₽.`;
    },
    choices: [
        { text: '🔗 Поделиться', action: () => {
            if (chance(0.5)){
                player.referrals = (player.referrals || 0) + 1;
                money(500);
                showToast('🔗','Реферал','Друг зашёл! +500₽');
            } else {
                showToast('😔','Реферал','Пока никто.');
            }
            setTimeout(() => showScene('main'), 1500);
        }},
        { text: '↩️ Назад', next: 'main', style: 'back' }
    ]
},

/* ============================================================
   ДЕНЬ 1 — ПЕРВЫЙ ДЕНЬ В ШКОЛЕ
   ============================================================ */

day1_start: {
    emoji: '☀️',
    time: 'morning',
    title: 'Утро · 1 сентября',
    text: () => {
        return `7 утра. Мама будит тебя за плечо:\n\n«${player.name}, вставай, солнышко. Первый день. Опоздаем — будет плохо».\n\nНа кухне — каша и стакан чая. Мама уже в форме завода — она забежала домой только чтобы проводить тебя.`;
    },
    choices: [
        { text: '🍽️ Поесть спокойно', next: 'day1_breakfast' },
        { text: '🚪 Выйти без завтрака', next: 'day1_skip_breakfast' }
    ]
},

day1_breakfast: {
    emoji: '🍽️',
    time: 'morning',
    title: 'Завтрак',
    text: () => {
        if (isGirl()){
            return `Ты ешь кашу. Мама смотрит на тебя и улыбается:\n\n«Ты у меня взрослая уже. Первый день — это важно. Учись хорошо, ладно?»\n\nОна целует тебя в лоб и уходит на работу.`;
        }
        return `Ты ешь кашу. Мама смотрит на тебя и улыбается:\n\n«Ты у меня взрослый уже. Первый день — это важно. Учись хорошо, ладно?»\n\nОна целует тебя в лоб и уходит на работу.`;
    },
    onEnter: () => {
        stat('happiness', 1);
        statMom('relationship', 1);
    },
    choices: [
        { text: '🚪 Выйти из дома', next: 'day1_walk' }
    ]
},

day1_skip_breakfast: {
    emoji: '🚪',
    time: 'morning',
    title: 'Без завтрака',
    text: () => {
        return `Ты выбегаешь из дома. Мама кричит в след:\n\n«Хоть бутерброд возьми!» — но ты уже не слышишь.\n\nЖивот урчит. Настроение так себе.`;
    },
    onEnter: () => {
        stat('happiness', -1);
        player.stats.health -= 1;
        if (player.stats.health < 0) player.stats.health = 0;
    },
    choices: [
        { text: '🚪 Идти в школу', next: 'day1_walk' }
    ]
},

day1_walk: {
    emoji: '🚶',
    time: 'morning',
    title: 'Дорога в школу',
    text: () => {
        return `Ты идёшь по улице. Осень, желтые листья, утренний холод.\n\nВпереди — школа №3. Серое здание, серый забор, серые лица.\n\nТы заходишь во двор. Линейка уже собирается.`;
    },
    choices: [
        { text: '👥 Встать в строй', next: 'day1_lineup' }
    ]
},

day1_lineup: {
    emoji: '🎒',
    time: 'day',
    title: 'Линейка',
    text: () => {
        return `Директор что-то говорит в микрофон. Дети шумят, родители фоткают.\n\nТы стоишь в строю. Рядом — пацан, который смотрит на тебя с интересом.\n\n«Ты ${g('новенький','новенькая')}?» — спрашивает он.`;
    },
    choices: [
        { text: '😊 Да, я ' + g('новый','новая') + '. А ты?', next: 'day1_meet_yanchik' },
        { text: '😐 Молча кивнуть', next: 'day1_ignore_yanchik' }
    ]
},

day1_meet_yanchik: {
    emoji: '🧑',
    time: 'day',
    title: 'Знакомство',
    text: () => {
        return `«Я Янчик. Тоже тут второй год. Ты норм, я вижу».\n\nОн жмёт тебе руку. Впервые за день кто-то улыбнулся тебе искренне.`;
    },
    onEnter: () => {
        player.friends = (player.friends || 0) + 1;
        player.yanchik = { name: 'Янчик', relationship: 3 };
        stat('charisma', 1);
    },
    choices: [
        { text: '🎓 Идти в класс', next: 'day1_class' }
    ]
},

day1_ignore_yanchik: {
    emoji: '😐',
    time: 'day',
    title: 'Молчание',
    text: () => {
        return `Ты молчишь. Янчик пожимает плечами и отворачивается.\n\nНу и ладно. Может, оно и к лучшему.`;
    },
    onEnter: () => {
        player.yanchik = { name: 'Янчик', relationship: 0 };
    },
    choices: [
        { text: '🎓 Идти в класс', next: 'day1_class' }
    ]
},

day1_class: {
    emoji: '🏫',
    time: 'day',
    title: 'Первый урок',
    text: () => {
        return `Ты заходишь в класс. Дети рассаживаются. Учительница, Ольга Петровна, оглядывает всех.\n\n«Сегодня у нас первый день. Давайте познакомимся. ${player.name}, начнём с тебя?»\n\nВесь класс смотрит на тебя.`;
    },
    choices: [
        { text: '💪 Рассказать уверенно', next: 'day1_speak_confident' },
        { text: '😳 Застесняться и замолчать', next: 'day1_speak_shy' },
        { text: '😂 Отшутиться', next: 'day1_speak_joke' }
    ]
},

day1_speak_confident: {
    emoji: '💪',
    time: 'day',
    title: 'Уверенно',
    text: () => {
        return `«Меня зовут ${player.name}. Я живу тут недалеко. Хочу стать кем-то большим».\n\nОльга Петровна улыбается: «Хорошо, ${player.name}. Садись».\n\nКласс смотрит с уважением.`;
    },
    onEnter: () => {
        stat('charisma', 1);
        stat('happiness', 1);
    },
    choices: [
        { text: '🛎️ Перемена', next: 'day1_break' }
    ]
},

day1_speak_shy: {
    emoji: '😳',
    time: 'day',
    title: 'Застеснялся',
    text: () => {
        return `Ты мычишь что-то невнятное. Кто-то из класса хихикает.\n\nОльга Петровна говорит: «Ничего, привыкнешь». Но тебе стыдно.`;
    },
    onEnter: () => {
        stat('happiness', -1);
        stat('charisma', -1);
    },
    choices: [
        { text: '🛎️ Перемена', next: 'day1_break' }
    ]
},

day1_speak_joke: {
    emoji: '😂',
    time: 'day',
    title: 'Шутка',
    text: () => {
        return `«Я — ${player.name}. Пришёл сюда потому что мама сказала, а маму надо слушать».\n\nПоловина класса ржёт. Ольга Петровна улыбается, хотя и с укором.`;
    },
    onEnter: () => {
        stat('charisma', 1);
        if (chance(0.5)) {
            stat('happiness', 1);
        } else {
            stat('happiness', -1);
        }
    },
    choices: [
        { text: '🛎️ Перемена', next: 'day1_break' }
    ]
},

day1_break: {
    emoji: '🔔',
    time: 'day',
    title: 'Перемена',
    text: () => {
        return `Звонок. Все выходят в коридор. Ты стоишь у окна.\n\nВдруг сзади голос:\n\n«Эй, ${g('новенький','новенькая')}. Чё это у тебя кроссовки такие? В секонд-хенде ${g('брал','брала')}?»\n\nЭто Влад. Он стоит с двумя пацанами и ржёт.`;
    },
    choices: [
        { text: '😡 Ответить резко', next: 'day1_vlad_angry' },
        { text: '🙇 Промолчать', next: 'day1_vlad_silent' },
        { text: '😂 Обратить в шутку', next: 'day1_vlad_joke' }
    ]
},

day1_vlad_angry: {
    emoji: '😡',
    time: 'day',
    title: 'Резко',
    text: () => {
        return `«А тебе какое дело, лощёный?»\n\nВлад на секунду теряется, потом ухмыляется: «А ты ${g('дерзкий','дерзкая')}. Ладно, посмотрим, как ты запоёшь».\n\nОн уходит. Янчик рядом шепчет: «Зря ты так. У него отец в администрации».`;
    },
    onEnter: () => {
        storyFlags.vladReaction = 'angry';
        statEnemy('relationship', -2);
        player.enemies = (player.enemies || 0) + 1;
    },
    choices: [
        { text: '🏫 После школы', next: 'day1_after_school' }
    ]
},

day1_vlad_silent: {
    emoji: '🙇',
    time: 'day',
    title: 'Промолчал',
    text: () => {
        return `Ты молчишь. Влад ржёт громче: «Чё, язык проглотил?»\n\nНо потом ему становится скучно, и он уходит. Пацаны за ним.\n\nЧто-то внутри тебя сжалось.`;
    },
    onEnter: () => {
        storyFlags.vladReaction = 'silent';
        stat('happiness', -2);
        statEnemy('relationship', -1);
    },
    choices: [
        { text: '🏫 После школы', next: 'day1_after_school' }
    ]
},

day1_vlad_joke: {
    emoji: '😂',
    time: 'day',
    title: 'Шутка',
    text: () => {
        return `«Секонд-хенд? Да у нас весь район в нём одевается. Ты чё, с Луны свалился?»\n\nПацаны Влада ржут — но уже НАД НИМ. Влад краснеет и уходит.`;
    },
    onEnter: () => {
        storyFlags.vladReaction = 'joke';
        if (player.stats.charisma >= 5) {
            stat('charisma', 1);
            stat('happiness', 2);
            statEnemy('relationship', -1);
            showToast('🎯','Успех','Ты отбился словами.');
        } else {
            stat('happiness', -1);
            statEnemy('relationship', -2);
            showToast('😐','Не зашло','Влад не оценил.');
        }
    },
    choices: [
        { text: '🏫 После школы', next: 'day1_after_school' }
    ]
},

day1_after_school: {
    emoji: '🚶',
    time: 'evening',
    title: 'После школы',
    text: () => {
        return `Последний урок закончился. Ты выходишь на улицу.\n\nДомой идти 15 минут. Мама вернётся только вечером — у неё вторая смена.\n\nДома никого. Только ты и тишина.`;
    },
    choices: [
        { text: '🏠 Идти домой', next: 'day1_home' },
        { text: '🚶 Пройтись по району', next: 'day1_walk_home' }
    ]
},

day1_walk_home: {
    emoji: '🌆',
    time: 'evening',
    title: 'Прогулка',
    text: () => {
        return `Ты идёшь не домой, а по улицам района. Смотришь на дома, на людей.\n\nВидишь мужиков у пивного ларька, женщин с сумками, пацанов на лавке.\n\nЭто твой район. Здесь всё будет.`;
    },
    onEnter: () => {
        stat('happiness', 1);
    },
    choices: [
        { text: '🏠 Домой', next: 'day1_home' }
    ]
},

day1_home: {
    emoji: '🏠',
    time: 'evening',
    title: 'Дом',
    text: () => {
        return `Ты заходишь домой. Пусто. На плите — кастрюля с борщом, мама оставила.\n\nТы ешь один. Смотришь в окно.\n\nНа часах 7 вечера. Мама ещё не пришла. Спать?`;
    },
    choices: [
        { text: '😴 Лечь спать', next: 'day1_sleep' },
        { text: '📺 Посмотреть телевизор', next: 'day1_tv' }
    ]
},

day1_tv: {
    emoji: '📺',
    time: 'evening',
    title: 'Телевизор',
    text: () => {
        return `Ты включаешь старый телевизор. Идёт новостной канал.\n\n«В администрации города продолжаются кадровые перестановки...»\n\nТы засыпаешь под бормотание диктора.`;
    },
    onEnter: () => {
        stat('happiness', 1);
    },
    choices: [
        { text: '😴 Спать', next: 'day1_sleep' }
    ]
},

day1_sleep: {
    emoji: '🌙',
    time: 'night',
    title: 'Конец дня',
    text: () => {
        return `Ты ложишься в кровать. В голове крутится сегодняшний день.\n\nЯнчик, Влад, учительница...\n\nТы не знаешь, что будет завтра. Но что-то подсказывает — интересное.`;
    },
    choices: [
        { text: '➡️ Следующий день', action: () => { nextDay(); } }
    ]
},

/* ============================================================
   ДЕНЬ 2 — СЛУХИ
   ============================================================ */

day2_start: {
    emoji: '🌧️',
    time: 'morning',
    decor: 'rain',
    title: 'Утро · вторник',
    text: () => {
        const vlad = storyFlags.vladReaction || 'default';
        let vladLine = '';
        if (vlad === 'angry') vladLine = 'Вчера ты резко ответил Владу. Слух разнёсся по всей школе.';
        if (vlad === 'silent') vladLine = 'Вчера ты проглотил насмешку Влада. Кто-то видел — и сегодня будут шутить.';
        if (vlad === 'joke') vladLine = 'Вчера ты обратил всё в шутку и выставил Влада посмешищем. У него теперь зуб на тебя.';

        return `Будильник. Вторник. За окном моросит дождь.\n\nТы встаёшь, идёшь на кухню. Мамы нет — она ушла на смену раньше.\n\n${vladLine}\n\nОдеваешься. Пора в школу.`;
    },
    choices: [
        { text: '🎒 Взять зонт', next: 'day2_umbrella' },
        { text: '🚪 Выйти без зонта', next: 'day2_no_umbrella' }
    ]
},

day2_umbrella: {
    emoji: '☂️',
    time: 'morning',
    decor: 'rain',
    title: 'С зонтом',
    text: () => {
        return `Ты берёшь старый мамин зонт — чёрный, с одной сломанной спицей.\n\nПо дороге ты сухой. Остальные — мокрые. Мелочь, а приятно.`;
    },
    onEnter: () => {
        stat('happiness', 1);
    },
    choices: [
        { text: '🏫 Школа', next: 'day2_school' }
    ]
},

day2_no_umbrella: {
    emoji: '🌧️',
    time: 'morning',
    decor: 'rain',
    title: 'Без зонта',
    text: () => {
        return `Ты выходишь без зонта. Дождь бьёт по лицу, куртка намокает за минуту.\n\nК школе ты приходишь мокрый как мышь. Кто-то смотрит и хихикает.`;
    },
    onEnter: () => {
        stat('happiness', -1);
        stat('health', -1);
    },
    choices: [
        { text: '🏫 Школа', next: 'day2_school' }
    ]
},

day2_school: {
    emoji: '🏫',
    time: 'day',
    decor: 'rain',
    title: 'Школа',
    text: () => {
        const yan = player.yanchik && player.yanchik.relationship >= 3;
        let yanLine = '';
        if (yan) yanLine = `Янчик машет тебе из коридора: «Здорово!»`;
        else yanLine = 'Янчик стоит в стороне и не смотрит на тебя.';

        return `В школе шумно. Все обсуждают вчерашнее.\n\n${yanLine}\n\nНа первом уроке — литература. Учительница задаёт вопрос: «Кто прочитал стихотворение Пушкина?»`;
    },
    choices: [
        { text: '✋ Поднять руку', next: 'day2_answer' },
        { text: '😐 Промолчать', next: 'day2_silent' }
    ]
},

day2_answer: {
    emoji: '📖',
    time: 'day',
    decor: 'rain',
    title: 'Ответ',
    text: () => {
        return `Ты поднимаешь руку и читаешь стих наизусть.\n\n«Мороз и солнце; день чудесный...»\n\nОльга Петровна улыбается: «Молодец, ${player.name}. Пятёрка».`;
    },
    onEnter: () => {
        stat('intelligence', 1);
        stat('happiness', 1);
    },
    choices: [
        { text: '🔔 Перемена', next: 'day2_break' }
    ]
},

day2_silent: {
    emoji: '😐',
    time: 'day',
    decor: 'rain',
    title: 'Промолчал',
    text: () => {
        return `Ты опускаешь глаза в парту. Учительница вызывает кого-то другого.\n\nВнутри ты понимаешь: надо было ответить.`;
    },
    onEnter: () => {
        stat('happiness', -1);
    },
    choices: [
        { text: '🔔 Перемена', next: 'day2_break' }
    ]
},

day2_break: {
    emoji: '🔔',
    time: 'day',
    decor: 'rain',
    title: 'Перемена · Влад',
    text: () => {
        return `Ты выходишь в коридор. К тебе подходит Влад с пацанами.\n\n«Слышь, я тут подумал. Ты норм, если по-нормальному. Есть тема — хочешь двинуться после школы? Есть одно место на Седова. Милк. Там наши тусят».\n\nОн смотрит на тебя в упор. Янчик за спиной тихо говорит: «Не ходи. Это развод».`;
    },
    choices: [
        { text: '🤝 Согласиться', next: 'day2_agree_vlad' },
        { text: '🚫 Отказаться', next: 'day2_decline_vlad' },
        { text: '🤔 Спросить «какие ещё ваши?»', next: 'day2_ask_vlad' }
    ]
},

day2_agree_vlad: {
    emoji: '🤝',
    time: 'day',
    decor: 'rain',
    title: 'Согласился',
    text: () => {
        return `«Ну ладно, зайду». Влад ухмыляется: «Не пожалеешь». Пацаны за спиной переглядываются.\n\nЯнчик молча смотрит тебе вслед.`;
    },
    onEnter: () => {
        storyFlags.wentWithVlad = true;
        statEnemy('relationship', 1);
    },
    choices: [
        { text: '🏫 После школы', next: 'day2_after_school' }
    ]
},

day2_decline_vlad: {
    emoji: '🚫',
    time: 'day',
    decor: 'rain',
    title: 'Отказался',
    text: () => {
        return `«Не, я домой». Влад пожимает плечами: «Ну и лох». Пацаны ржут.\n\nЯнчик подходит: «Правильно сделал. Он мутит какую-то хуйню, я знаю».`;
    },
    onEnter: () => {
        statEnemy('relationship', -2);
        if (player.yanchik) player.yanchik.relationship += 2;
        stat('happiness', 1);
    },
    choices: [
        { text: '🏫 После школы', next: 'day2_after_school' }
    ]
},

day2_ask_vlad: {
    emoji: '🤔',
    time: 'day',
    decor: 'rain',
    title: 'Спросил',
    text: () => {
        return `«Какие ещё ваши?» Влад на секунду теряется, потом ржёт: «Шальные, блять. Ты чё, с луны ${g('свалился','свалилась')}? Тебя кто вообще сюда пустил».\n\nОн уходит с пацанами, а Янчик шепчет: «Шальные — это команда культурно-массового досуга. Они дискотеки в ЦРК делают. Но у них свои тёрки с ментами бывают».`;
    },
    onEnter: () => {
        statEnemy('relationship', -1);
        if (player.yanchik) player.yanchik.relationship += 1;
        dayFlags.knowsShalnye = true;
    },
    choices: [
        { text: '🏫 После школы', next: 'day2_after_school' }
    ]
},

day2_after_school: {
    emoji: '🌆',
    time: 'evening',
    title: 'После школы',
    text: () => {
        return `Уроки закончились. Дождь стих, но серо.\n\nТы выходишь на улицу. Что делать?`;
    },
    choices: () => {
        const list = [];

        if (storyFlags.wentWithVlad){
            list.push({ text: '🍔 Пойти в Милк с Владом', next: 'day2_milk' });
        }

        if (player.yanchik && player.yanchik.relationship >= 3){
            list.push({ text: '🏞️ Пойти с Янчиком в парк Киселёва', next: 'day2_park_kiselev' });
        }

        list.push({ text: '🏠 Идти домой', next: 'day2_home' });

        return list;
    }
},

day2_milk: {
    emoji: '🍔',
    time: 'evening',
    title: 'Милк · Седова 113',
    text: () => {
        return `Кафе «Милк» на Седова. Внутри светло, пахнет бургерами.\n\nВлад сидит с тремя пацанами. Один из них — здоровый, в спортивке, с цепью на шее. Это Кирилл. У него на костяшках наколки. Про него в районе говорят разное — то ли он с Шальными, то ли сам по себе. Но его знают все.\n\n«Слышь, ${player.name}, садись. Мы тут с пацанами тему мутим. Кароче, есть один замут. На ГАИ. Хочешь участвовать — бабки будут».\n\nОн смотрит на тебя как на мясо.`;
    },
    choices: [
        { text: '💰 Спросить сколько', next: 'day2_milk_ask' },
        { text: '🚫 Отказаться и уйти', next: 'day2_milk_leave' }
    ]
},

day2_milk_ask: {
    emoji: '💰',
    time: 'evening',
    title: 'Спросил сколько',
    text: () => {
        return `«Сколько?» Кирилл ржёт: «Ну ты даёшь, малыш. Пока ничего. Пока просто посмотришь. Научишься. Потом уже и про бабки говорить будем».\n\nВлад: «Не сцы, всё по-нормальному».`;
    },
    onEnter: () => {
        dayFlags.tiedToShalnye = true;
    },
    choices: [
        { text: '🤐 Согласиться и уйти', next: 'day2_end' },
        { text: '🚫 Встать и уйти', next: 'day2_milk_leave' }
    ]
},

day2_milk_leave: {
    emoji: '🚶',
    time: 'evening',
    title: 'Ушёл',
    text: () => {
        return `Ты встаёшь: «Не, я пас». Кирилл ухмыляется: «Ну и вали, ${g('малой','малая')}». Влад смотрит на тебя как на предателя.\n\nТы выходишь на улицу. Свежий воздух. Тебе легче.`;
    },
    onEnter: () => {
        statEnemy('relationship', -3);
        stat('happiness', 1);
    },
    choices: [
        { text: '🏠 Домой', next: 'day2_home' }
    ]
},

day2_park_kiselev: {
    emoji: '🏞️',
    time: 'evening',
    decor: 'rain',
    title: 'Парк Киселёва',
    text: () => {
        return `Вы с Янчиком идёте в парк Киселёва. Там памятник праведнику, тир, старая аллея.\n\nЯнчик рассказывает: «Тут раньше все тусили. Сейчас больше на Резинке — это у самого парка, за гаражами. Знаешь где?»`;
    },
    choices: [
        { text: '🤔 Что за Резинка?', next: 'day2_park_ask' },
        { text: '😎 Да, знаю', next: 'day2_park_know' }
    ]
},

day2_park_ask: {
    emoji: '🤔',
    time: 'evening',
    title: 'Спросил',
    text: () => {
        return `«Резинка — это там, где пацаны собираются. Ну, типа движ. Там реально свои. Ты пока не ходи, тебя не знают. Вот как подрастёшь немного — пойдём вместе».\n\nОн хлопает тебя по плечу.`;
    },
    onEnter: () => {
        dayFlags.knowsRezinka = true;
        if (player.yanchik) player.yanchik.relationship += 1;
    },
    choices: [
        { text: '🏠 Домой', next: 'day2_home' }
    ]
},

day2_park_know: {
    emoji: '😎',
    time: 'evening',
    title: 'Знаю',
    text: () => {
        return `«Ну да, знаю». Янчик хмыкает: «Ну красава, чё. Только это, не ходи туда ${g('один','одна')}. Там старшаки, могут докопаться».\n\nВы гуляете по аллее. Хорошо.`;
    },
    onEnter: () => {
        stat('happiness', 1);
        if (player.yanchik) player.yanchik.relationship += 1;
    },
    choices: [
        { text: '🏠 Домой', next: 'day2_home' }
    ]
},

day2_end: {
    emoji: '🌙',
    time: 'night',
    title: 'Конец дня',
    text: () => {
        return `Ты идёшь домой. В голове вертится разговор в Милке.\n\nКирилл, ГАИ...\n\nТы чувствуешь, что что-то начинается. Что-то серьёзное.`;
    },
    choices: [
        { text: '➡️ Следующий день', action: () => { nextDay(); } }
    ]
},

day2_home: {
    emoji: '🏠',
    time: 'evening',
    title: 'Дом',
    text: () => {
        return `Ты дома. Мама уже вернулась, сидит на кухне с чаем.\n\n«Как дела, ${g('сынок','дочка')}?»`;
    },
    choices: [
        { text: '😊 Хорошо', next: 'day2_mom_good' },
        { text: '😔 Плохо — рассказать', next: 'day2_mom_talk' },
        { text: '😐 Сказать «норм»', next: 'day2_mom_short' }
    ]
},

day2_mom_good: {
    emoji: '👩',
    time: 'evening',
    title: 'Мама',
    text: () => {
        return `«Хорошо». Мама улыбается, но что-то в её взгляде — не верит.\n\n«Ну и славно. Ешь давай».\n\nОна гладит тебя по голове и уходит к плите.`;
    },
    onEnter: () => {
        statMom('relationship', 1);
        stat('happiness', 1);
    },
    choices: [
        { text: '😴 Спать', next: 'day2_sleep' }
    ]
},

day2_mom_talk: {
    emoji: '👩',
    time: 'evening',
    title: 'Разговор с мамой',
    text: () => {
        return `Ты рассказываешь, как тяжело. Про школу, про Влада, про то, что не понимаешь, как жить дальше.\n\nМама слушает молча. Потом говорит:\n\n«Знаешь что, ${g('сынок','дочка')}. Жизнь — она вообще несправедливая штука. Но у тебя есть голова на плечах и руки. Это уже много. Не сдавайся. И не лезь туда, где тебе не место».\n\nОна обнимает тебя.`;
    },
    onEnter: () => {
        statMom('relationship', 3);
        stat('happiness', 1);
    },
    choices: [
        { text: '🤝 Спасибо, мама', next: 'day2_sleep' },
        { text: '😐 Промолчать', next: 'day2_silent_promise' }
    ]
},

day2_silent_promise: {
    emoji: '👩',
    time: 'evening',
    title: 'Мама',
    text: () => {
        return `Ты молчишь. Мама вздыхает: «Ну хоть не ври, что ${g('обещал','обещала')}».\n\nОна целует тебя в лоб и уходит в комнату.`;
    },
    onEnter: () => {
        statMom('relationship', 1);
        stat('happiness', -1);
    },
    choices: [
        { text: '😴 Спать', next: 'day2_sleep' }
    ]
},

day2_mom_short: {
    emoji: '👩',
    time: 'evening',
    title: 'Коротко',
    text: () => {
        return `«Норм». Мама смотрит на тебя внимательно, но не давит. Просто кивает.\n\nОна знает — если захочешь, сам расскажешь.`;
    },
    onEnter: () => {
        stat('happiness', -1);
    },
    choices: [
        { text: '😴 Спать', next: 'day2_sleep' }
    ]
},

day2_sleep: {
    emoji: '🌙',
    time: 'night',
    title: 'Сон',
    text: () => {
        return `Ты ложишься спать. Завтра среда — снова школа.\n\nМысли путаются. Засыпаешь.`;
    },
    choices: [
        { text: '➡️ Следующий день', action: () => { nextDay(); } }
    ]
},

/* ============================================================
   ДЕНЬ 3 — КОНТРОЛЬНАЯ И ДИСКОТЕКА
   ============================================================ */

day3_start: {
    emoji: '📚',
    time: 'morning',
    title: 'Утро · среда',
    text: () => {
        return `Среда. Половина недели прошла.\n\nТы идёшь в школу. Сегодня контрольная по математике.`;
    },
    choices: [
        { text: '📖 Повторить по дороге', next: 'day3_study' },
        { text: '🚶 Просто идти', next: 'day3_walk' }
    ]
},

day3_study: {
    emoji: '📖',
    time: 'morning',
    title: 'Повторил',
    text: () => {
        return `Ты быстро листаешь учебник по дороге. Что-то откладывается в голове.`;
    },
    onEnter: () => {
        stat('intelligence', 1);
        dayFlags.studiedForTest = true;
    },
    choices: [
        { text: '🏫 Школа', next: 'day3_school' }
    ]
},

day3_walk: {
    emoji: '🚶',
    time: 'morning',
    title: 'Просто идёшь',
    text: () => {
        return `Ты не заморачиваешься. Идёшь спокойно, слушаешь музыку в наушниках.`;
    },
    choices: [
        { text: '🏫 Школа', next: 'day3_school' }
    ]
},

day3_school: {
    emoji: '🏫',
    time: 'day',
    title: 'Контрольная',
    text: () => {
        return `Контрольная по математике. Ольга Петровна раздаёт листы.\n\nВопросы не самые сложные, но есть пара хитрых.`;
    },
    choices: [
        { text: '🧠 Решать самому', next: 'day3_solve_self' },
        { text: '👀 Списывать у соседа', next: 'day3_solve_cheat' }
    ]
},

day3_solve_self: {
    emoji: '🧠',
    time: 'day',
    title: 'Сам',
    text: () => {
        const bonus = dayFlags.studiedForTest ? 'Ты помнишь формулы, всё идёт гладко.' : 'Пара заданий не поддаётся, но в целом норм.';
        return bonus;
    },
    onEnter: () => {
        const base = player.stats.intelligence;
        if (base >= 5 || dayFlags.studiedForTest){
            stat('intelligence', 1);
            stat('happiness', 1);
            showToast('📝','Пятёрка','Учительница довольна.');
        } else {
            stat('happiness', -1);
            showToast('📝','Тройка','Слабо, но не двойка.');
        }
    },
    choices: [
        { text: '🔔 Перемена', next: 'day3_break' }
    ]
},

day3_solve_cheat: {
    emoji: '👀',
    time: 'day',
    title: 'Списал',
    text: () => {
        return `Ты косишься на соседа и переписываешь решения. Сердце колотится.`;
    },
    choices: [
        { text: '😎 Прокатило', action: () => {
            if (chance(0.6)){
                stat('intelligence', 1);
                showToast('😎','Прокатило','Никто не заметил.');
            } else {
                stat('happiness', -1);
                showToast('🚨','Спалили','Ольга Петровна всё видела. Минус уважение.');
                stat('charisma', -1);
            }
            setTimeout(() => showScene('day3_break'), 1500);
        }},
        { text: '🤐 Признаться', next: 'day3_confess' }
    ]
},

day3_confess: {
    emoji: '🤐',
    time: 'day',
    title: 'Признался',
    text: () => {
        return `Ты говоришь: «Ольга Петровна, я ${g('списал','списала')}». Она смотрит на тебя долго.\n\n«Знаешь что... За честность — четвёрка. Но больше так не делай».`;
    },
    onEnter: () => {
        stat('charisma', 1);
        stat('happiness', 1);
    },
    choices: [
        { text: '🔔 Перемена', next: 'day3_break' }
    ]
},

day3_break: {
    emoji: '🔔',
    time: 'day',
    title: 'Перемена · Янчик',
    text: () => {
        return `Янчик подбегает к тебе: «Слышал новость? Сегодня вечером в ЦРК дискотека. Шальные собирают. Пойдёшь?»\n\nОн смотрит с надеждой.`;
    },
    choices: [
        { text: '🔥 Пойду', next: 'day3_agree_disco' },
        { text: '🚫 Не, домой', next: 'day3_decline_disco' },
        { text: '🤔 А что там будет?', next: 'day3_ask_disco' }
    ]
},

day3_agree_disco: {
    emoji: '🔥',
    time: 'day',
    title: 'Согласился',
    text: () => {
        return `«Ну, пойдём». Янчик рад: «Только это, смотри — там старшаки будут. Держись рядом».\n\nПосле школы вы идёте в ЦРК.`;
    },
    onEnter: () => {
        dayFlags.discoSet = true;
        if (player.yanchik) player.yanchik.relationship += 2;
    },
    choices: [
        { text: '🕺 Идти в ЦРК', next: 'day3_disco_go' }
    ]
},

day3_decline_disco: {
    emoji: '🚫',
    time: 'day',
    title: 'Отказался',
    text: () => {
        return `«Не, в другой раз». Янчик пожимает плечами: «Ладно, дело твоё». Он убегает к пацанам.\n\nТы идёшь домой ${g('один','одна')}.`;
    },
    onEnter: () => {
        stat('happiness', -1);
    },
    choices: [
        { text: '🏠 Домой', next: 'day3_home' }
    ]
},

day3_ask_disco: {
    emoji: '🤔',
    time: 'day',
    title: 'Спросил',
    text: () => {
        return `«А что там будет?» Янчик смеётся: «Музыка, движ, свои. Шальные делают движ. Там реально кайф, но надо уметь себя вести».\n\nОн поднимает брови.`;
    },
    choices: [
        { text: '🔥 Ладно, идём', next: 'day3_agree_disco' },
        { text: '🚫 Нет, домой', next: 'day3_decline_disco' }
    ]
},

day3_disco_go: {
    emoji: '🕺',
    time: 'evening',
    decor: 'disco',
    title: 'ЦРК · дискотека',
    text: () => {
        return `ЦРК. Бывший ГДК. Огромное здание с фонтаном (летом).\n\nВнутри — музыка, свет, толпа. Янчик тянет тебя через толпу.\n\nНа сцене парень с микрофоном. Он старше всех — лет 20, не меньше. Янчик шепчет: «Это Влад. Вожак Шальных. Только не тот Влад, который в школе. Это совсем другой человек».\n\n«Йо, малые! Сегодня отрываемся!» — кричит он в микрофон.`;
    },
    choices: [
        { text: '🔥 Влиться в движ', next: 'day3_disco_mix' },
        { text: '🚶 Понаблюдать со стороны', next: 'day3_disco_watch' }
    ]
},

day3_disco_mix: {
    emoji: '🔥',
    time: 'evening',
    decor: 'disco',
    title: 'Вливаешься',
    text: () => {
        return `Ты танцуешь. Кто-то толкает тебя — ты толкаешь обратно. Все ржут.\n\nЯнчик: «Красава! Так и надо!»\n\nНесколько пацанов смотрят на тебя с интересом.`;
    },
    onEnter: () => {
        stat('charisma', 1);
        stat('happiness', 2);
        player.friends = (player.friends || 0) + 1;
    },
    choices: [
        { text: '🎤 Подойти к сцене', next: 'day3_disco_scene' }
    ]
},

day3_disco_watch: {
    emoji: '🚶',
    time: 'evening',
    decor: 'disco',
    title: 'Наблюдаешь',
    text: () => {
        if (isGirl()){
            return `Ты стоишь в стороне. Смотришь, как веселятся другие.\n\nКто-то подходит: «Ты чё стоишь как неродная? Идём танцевать!»\n\nЭто парень. Улыбается.`;
        }
        return `Ты стоишь в стороне. Смотришь, как веселятся другие.\n\nКто-то подходит: «Ты чё стоишь как еблан? Идём танцевать!»\n\nЭто девчонка. Улыбается.`;
    },
    onEnter: () => {
        stat('happiness', 1);
        stat('charisma', 1);
    },
    choices: [
        { text: '😊 Пойти танцевать', next: 'day3_disco_mix' },
        { text: '🤐 Стесняться', next: 'day3_disco_shy' }
    ]
},

day3_disco_shy: {
    emoji: '🤐',
    time: 'evening',
    decor: 'disco',
    title: 'Стесняешься',
    text: () => {
        if (isGirl()){
            return `Ты мычишь что-то. Парень пожимает плечами и уходит к другим.\n\nЯнчик рядом: «Зря, ${g('братан','сестрёнка')}. Он норм».`;
        }
        return `Ты мычишь что-то. Девчонка пожимает плечами и уходит к другим.\n\nЯнчик рядом: «Зря, братан. Она норм».`;
    },
    onEnter: () => {
        stat('happiness', -1);
    },
    choices: [
        { text: '🎤 Подойти к сцене', next: 'day3_disco_scene' }
    ]
},

day3_disco_scene: {
    emoji: '🎤',
    time: 'evening',
    decor: 'disco',
    title: 'У сцены',
    text: () => {
        return `Ты подходишь к сцене. Взрослый Влад смотрит на тебя: «Э, ${g('малой','малая')}. Ты кто?»\n\nЯнчик рядом шепчет: «Скажи имя».`;
    },
    choices: [
        { text: '💪 Сказать уверенно', action: () => {
            stat('charisma', 1);
            stat('happiness', 1);
            showToast('🎤','Знакомство','«Я '+player.name+'. Буду с вами».');
            setTimeout(() => showScene('day3_disco_end'), 1500);
        }},
        { text: '😳 Стесняться', action: () => {
            stat('charisma', -1);
            stat('happiness', -1);
            showToast('😳','Не зашло','«Ну и иди отсюда».');
            setTimeout(() => showScene('day3_disco_end'), 1500);
        }}
    ]
},

day3_disco_end: {
    emoji: '🌙',
    time: 'night',
    decor: 'disco',
    title: 'После дискотеки',
    text: () => {
        return `Дискотека закончилась. Вы с Янчиком идёте домой.\n\nЯнчик: «Ну чё, как тебе движ?»\n\nТы чувствуешь — что-то изменилось. Ты теперь не просто ${g('малой','малая')} из школы. Ты — часть чего-то.`;
    },
    onEnter: () => {
        stat('happiness', 1);
        dayFlags.shalnyeKnow = true;
    },
    choices: [
        { text: '🏠 Домой', next: 'day3_home' }
    ]
},

day3_home: {
    emoji: '🏠',
    time: 'night',
    title: 'Дом',
    text: () => {
        return `Ты заходишь домой. Мама уже спит.\n\nНа кухне записка: «Поешь. Я на работе устала. Люблю. Мама».\n\nТы ешь и ложишься.`;
    },
    onEnter: () => {
        statMom('relationship', 1);
    },
    choices: [
        { text: '➡️ Следующий день', action: () => { nextDay(); } }
    ]
},

/* ============================================================
   ДЕНЬ 4 — СУББОТА, МАМА БОЛЕЕТ
   ============================================================ */

day4_start: {
    emoji: '☔',
    time: 'morning',
    title: 'Суббота · утро',
    text: () => {
        return `Ты просыпаешься от того, что кто-то кашляет. Из спальни мамы.\n\nТы заходишь — мама лежит, вся красная, температура. Она шепчет:\n\n«${player.name}, ${g('сынок','дочка')}, сходи в аптеку, будь ${g('добр','добра')}. У меня градусник 38 и 5. И хлеба купи, если деньги найдутся».\n\nОна протягивает тебе мятую сотню.`;
    },
    onEnter: () => {
        money(100);
    },
    choices: [
        { text: '💊 Сходить в аптеку', next: 'day4_pharmacy' },
        { text: '🍞 Купить только хлеб', next: 'day4_bread' },
        { text: '🛌 Остаться дома с мамой', next: 'day4_stay_home' }
    ]
},

day4_pharmacy: {
    emoji: '💊',
    time: 'day',
    title: 'Аптека',
    text: () => {
        return `Ты идёшь в аптеку на Седова. Фармацевт — пожилая женщина в очках — смотрит на тебя:\n\n«Что, мама заболела? Жаропонижающее? Парацетамол 60 рублей. Ещё что-нибудь?»\n\nУ тебя 100 рублей.`;
    },
    choices: [
        { text: '💊 Взять парацетамол — 60₽', next: 'day4_pharmacy_buy' },
        { text: '💊 Взять парацетамол + витаминки — 100₽', next: 'day4_pharmacy_full' },
        { text: '🚶 Уйти без лекарств', next: 'day4_pharmacy_leave' }
    ]
},

day4_pharmacy_buy: {
    emoji: '💊',
    time: 'day',
    title: 'Купил',
    text: () => {
        return `Ты берёшь парацетамол за 60 рублей. Остаётся 40 — на хлеб.\n\nФармацевт суёт тебе ещё леденец: «От мамы».`;
    },
    onEnter: () => {
        money(-60);
        stat('happiness', 1);
        statMom('relationship', 2);
        dayFlags.momMedsBought = true;
    },
    choices: [
        { text: '🍞 Домой', next: 'day4_home_with_meds' }
    ]
},

day4_pharmacy_full: {
    emoji: '💊',
    time: 'day',
    title: 'Купил всё',
    text: () => {
        return `Ты берёшь парацетамол и витаминки — ровно 100 рублей. Денег на хлеб не осталось.\n\n«Хороший ты ${g('сын','дочь')}», — улыбается фармацевт.`;
    },
    onEnter: () => {
        money(-100);
        stat('happiness', 1);
        statMom('relationship', 3);
        dayFlags.momMedsBought = true;
        dayFlags.noMoneyForBread = true;
    },
    choices: [
        { text: '🏠 Домой', next: 'day4_home_with_meds' }
    ]
},

day4_pharmacy_leave: {
    emoji: '🚶',
    time: 'day',
    title: 'Ушёл',
    text: () => {
        return `Ты выходишь из аптеки. Что-то внутри сжалось. Мама болеет, а ты даже лекарство не купил.\n\nТы идёшь домой.`;
    },
    onEnter: () => {
        stat('happiness', -2);
        statMom('relationship', -2);
    },
    choices: [
        { text: '🏠 Домой', next: 'day4_home_no_meds' }
    ]
},

day4_bread: {
    emoji: '🍞',
    time: 'day',
    title: 'Хлеб',
    text: () => {
        return `Ты заходишь в «Магнит» рядом. Берёшь хлеб за 30 рублей. Остаётся 70.\n\nНа обратном пути ты проходишь мимо аптеки. Дверь открыта.`;
    },
    onEnter: () => {
        money(-30);
    },
    choices: [
        { text: '💊 Всё-таки зайти в аптеку', next: 'day4_pharmacy' },
        { text: '🏠 Идти домой', next: 'day4_home_no_meds' }
    ]
},

day4_stay_home: {
    emoji: '🛌',
    time: 'day',
    title: 'Остался с мамой',
    text: () => {
        return `Ты остаёшься. Мама сначала ругается: «Иди, иди, я сама справлюсь».\n\nНо ты не уходишь. Ставишь чайник, приносишь ей одеяло, сидишь рядом.\n\nОна засыпает. Ты смотришь в потолок и думаешь: каково это — быть взрослым?`;
    },
    onEnter: () => {
        stat('happiness', 1);
        statMom('relationship', 3);
        statMom('mood', 2);
    },
    choices: [
        { text: '💭 Пойти на кухню', next: 'day4_kitchen_talk' }
    ]
},

day4_kitchen_talk: {
    emoji: '🫖',
    time: 'day',
    title: 'Кухня',
    text: () => {
        return `Ты сидишь на кухне ${g('один','одна')}. На столе — фотография. Молодой мужчина, смеётся. Ты его никогда не видел.\n\nМама выходит, кутаясь в одеяло: «Это он. Твой отец».`;
    },
    choices: [
        { text: '💬 Спросить про отца', next: 'day4_ask_about_dad' },
        { text: '🤐 Промолчать', next: 'day4_silent_dad' }
    ]
},

day4_ask_about_dad: {
    emoji: '👨',
    time: 'evening',
    title: 'Отец',
    text: () => {
        return `«Он ушёл, когда ты родился. Сказал: не готов. Я не держала.\n\nЯ его не виню, ${player.name}. Просто так вышло. Но ты — мой. Ты ни в чём не виноват».\n\nОна гладит тебя по голове.`;
    },
    onEnter: () => {
        statMom('relationship', 3);
        stat('happiness', 1);
        dayFlags.knowsAboutDad = true;
    },
    choices: [
        { text: '😴 Спать', next: 'day4_sleep' }
    ]
},

day4_silent_dad: {
    emoji: '🤐',
    time: 'evening',
    title: 'Молчание',
    text: () => {
        return `Ты ничего не спрашиваешь. Мама грустно улыбается и уходит в комнату.\n\nТы остаёшься на кухне ${g('один','одна')}, с фотографией незнакомца.`;
    },
    onEnter: () => {
        stat('happiness', -1);
    },
    choices: [
        { text: '😴 Спать', next: 'day4_sleep' }
    ]
},

day4_home_with_meds: {
    emoji: '🏠',
    time: 'evening',
    title: 'Дом',
    text: () => {
        return `Ты возвращаешься с лекарствами. Мама пьёт таблетку, ложится.\n\n«Спасибо, ${g('сынок','дочка')}. Ты у меня ${g('лучший','лучшая')}».`;
    },
    onEnter: () => {
        statMom('relationship', 2);
    },
    choices: [
        { text: '😴 Спать', next: 'day4_sleep' }
    ]
},

day4_home_no_meds: {
    emoji: '🏠',
    time: 'evening',
    title: 'Дом',
    text: () => {
        return `Ты возвращаешься домой. Маме хуже — она вся горит.\n\nОна ничего не говорит. Просто закрывает глаза.`;
    },
    onEnter: () => {
        statMom('relationship', -1);
        stat('happiness', -1);
    },
    choices: [
        { text: '😴 Спать', next: 'day4_sleep' }
    ]
},

day4_sleep: {
    emoji: '🌙',
    time: 'night',
    title: 'Ночь',
    text: () => {
        return `Ты ложишься. Слышишь, как мама кашляет в соседней комнате.\n\nТы закрываешь глаза.`;
    },
    choices: [
        { text: '➡️ Следующий день', action: () => { nextDay(); } }
    ]
},

/* ============================================================
   ДЕНЬ 5 — РЕЗИНКА
   ============================================================ */

day5_start: {
    emoji: '🌤',
    time: 'morning',
    title: 'Воскресенье',
    text: () => {
        return `Воскресенье. Маме лучше — она уже пьёт чай на кухне.\n\nРаздаётся стук в дверь. Это Янчик.\n\n«Слышь, сегодня на Резинке собираются. Пойдём? Только держись рядом — там старшаки».`;
    },
    choices: [
        { text: '🔥 Пойдём на Резинку', next: 'day5_rezinka' },
        { text: '🚫 Не пойду, мама болеет', next: 'day5_decline' }
    ]
},

day5_rezinka: {
    emoji: '🏞️',
    time: 'day',
    title: 'Резинка',
    text: () => {
        return `Вы с Янчиком идёте к парку Киселёва. За домами — «Резинка».\n\nНа лавке сидят пацаны постарше. Один из них — Кирилл. У него на костяшках тату. Он тут не по линии Шальных — просто пасётся, свои тёрки мутит.\n\n«О, ${g('малой','малая')} ${g('пришёл','пришла')}», — усмехается он. — «А ты, я смотрю, не ссышь».`;
    },
    choices: [
        { text: '💪 Сказать «норм» и сесть рядом', next: 'day5_sit' },
        { text: '🙇 Скромно стоять в стороне', next: 'day5_stand' },
        { text: '🗣 Спросить, чё тут делают', next: 'day5_ask' }
    ]
},

day5_sit: {
    emoji: '💪',
    time: 'day',
    title: 'Сел',
    text: () => {
        return `Ты садишься рядом с Кириллом. Он смотрит на тебя с интересом:\n\n«Уважаю. ${g('Малой','Малая')}, но не сцыт». Он кивает своим — пацаны расслабляются.\n\nЯнчик выдыхает.`;
    },
    onEnter: () => {
        stat('charisma', 1);
        dayFlags.kirillRespect = true;
    },
    choices: [
        { text: '🚬 Покурить с пацанами', next: 'day5_smoke' },
        { text: '👂 Слушать о чём базарят', next: 'day5_listen' }
    ]
},

day5_stand: {
    emoji: '🙇',
    time: 'day',
    title: 'Стоишь',
    text: () => {
        return `Ты стоишь в стороне. Кирилл хмыкает:\n\n«Сцыт ${g('малой','малая')}. Ну и хуй с ${g('ним','ней')}». Пацаны ржут.\n\nЯнчик толкает тебя локтем: «Не будь лохом».`;
    },
    onEnter: () => {
        stat('happiness', -1);
        statEnemy('relationship', -1);
    },
    choices: [
        { text: '💪 Всё-таки сесть', next: 'day5_sit' },
        { text: '🏃 Уйти домой', next: 'day5_home' }
    ]
},

day5_ask: {
    emoji: '🗣',
    time: 'day',
    title: 'Спросил',
    text: () => {
        return `«А чё вы тут делаете?» Кирилл ухмыляется:\n\n«А ты прям в корень смотришь, ${g('малой','малая')}. Тут думаем. Планы строим. Есть тема на ГАИ — но тебе рано ещё».`;
    },
    onEnter: () => {
        stat('intelligence', 1);
        dayFlags.knowsPlan = true;
    },
    choices: [
        { text: '🚬 Покурить с пацанами', next: 'day5_smoke' },
        { text: '👂 Слушать о чём базарят', next: 'day5_listen' }
    ]
},

day5_smoke: {
    emoji: '🚬',
    time: 'day',
    title: 'Курить',
    text: () => {
        return `Кирилл протягивает тебе сигарету. Пацаны смотрят.\n\n«Ну чё, ${g('малой','малая')}? Держи, если не ссышь».`;
    },
    choices: [
        { text: '🚬 Взять и закурить', next: 'day5_smoke_yes' },
        { text: '🚫 Отказаться', next: 'day5_smoke_no' }
    ]
},

day5_smoke_yes: {
    emoji: '💨',
    time: 'day',
    title: 'Закурил',
    text: () => {
        return `Ты берёшь сигарету. Кашляешь, но держишься.\n\nКирилл хлопает тебя по плечу: «Красава. Свои».`;
    },
    onEnter: () => {
        if (!player.habits) player.habits = [];
        if (!player.habits.includes('сигареты')) player.habits.push('сигареты');
        stat('health', -1);
        stat('charisma', 1);
        dayFlags.smoked = true;
    },
    choices: [
        { text: '👂 Слушать дальше', next: 'day5_listen' }
    ]
},

day5_smoke_no: {
    emoji: '🚫',
    time: 'day',
    title: 'Отказался',
    text: () => {
        return `«Не, я не курю». Кирилл хмыкает: «Ну и правильно. Держись подальше».`;
    },
    onEnter: () => {
        stat('health', 1);
        stat('happiness', 1);
    },
    choices: [
        { text: '👂 Слушать дальше', next: 'day5_listen' }
    ]
},

day5_listen: {
    emoji: '👂',
    time: 'evening',
    title: 'Разговоры',
    text: () => {
        return `Пацаны базарят про дела. Про ГАИ, про каких-то мутных типов, про «Шальных».\n\nТы не всё понимаешь, но слушаешь внимательно. Что-то в этом есть — и опасное, и манящее.\n\nЯнчик тянет тебя за рукав: «Пойдём, хватит на сегодня».`;
    },
    onEnter: () => {
        stat('intelligence', 1);
    },
    choices: [
        { text: '🏠 Домой', next: 'day5_home' }
    ]
},

day5_decline: {
    emoji: '🚫',
    time: 'day',
    title: 'Остался',
    text: () => {
        return `Ты остаёшься с мамой. Помогаешь ей по дому, ставишь чайник, укутываешь пледом.\n\nЯнчик уходит ${g('один','одна')}. Обижен? Может быть.`;
    },
    onEnter: () => {
        statMom('relationship', 2);
        stat('happiness', 1);
    },
    choices: [
        { text: '🏠 Дом', next: 'day5_home' }
    ]
},

day5_home: {
    emoji: '🏠',
    time: 'evening',
    title: 'Дом',
    text: () => {
        if (dayFlags.kirillRespect || dayFlags.knowsPlan || dayFlags.smoked){
            return `Ты дома. Мама уже спит. Ты сидишь на кухне, думаешь.\n\nКирилл, пацаны, разговоры про ГАИ…\n\nТы чувствуешь, что в следующий раз ты уже не просто ${g('малой','малая')} из школы.`;
        }
        return `Ты дома. Мама уже спит.\n\nТы сидишь на кухне ${g('один','одна')}. День прошёл спокойно — без Резинки, без пацанов, без движа.\n\nМожет, оно и к лучшему. А может — ты что-то упустил.`;
    },
    choices: [
        { text: '😴 Спать', next: 'day5_sleep' }
    ]
},

day5_sleep: {
    emoji: '🌙',
    time: 'night',
    title: 'Ночь',
    text: () => {
        if (dayFlags.kirillRespect || dayFlags.knowsPlan || dayFlags.smoked){
            return `Ты ложишься. Сон не идёт. В голове крутятся разговоры с Резинки.\n\nТы засыпаешь только под утро.`;
        }
        return `Ты ложишься. Сон приходит быстро.\n\nТы не пошёл на Резинку. Может, правильно. А может — нет.`;
    },
    choices: [
        { text: '➡️ Следующий день', action: () => { nextDay(); } }
    ]
},

/* ============================================================
   ДЕНЬ 6 — ВЛАД ОТМАЗАЛСЯ
   ============================================================ */

day6_start: {
    emoji: '📚',
    time: 'morning',
    title: 'Понедельник',
    text: () => {
        return `Утро. Школа. Все обсуждают что-то.\n\nОказывается, на выходных Влад с пацанами **разгромили остановку** у стадиона. Разбили стекло, жгли урну, разнесли лавку.\n\nДиректор вызывает к себе… но не Влада.`;
    },
    choices: [
        { text: '🚶 Идти в школу', next: 'day6_school' }
    ]
},

day6_school: {
    emoji: '🏫',
    time: 'day',
    title: 'Школа',
    text: () => {
        return `На перемене весь коридор гудит. Влад ходит как ни в чём не бывало, ржёт с пацанами.\n\nЯнчик шепчет тебе: «Его отец в администрации. Он приехал в школу, поговорил с директором — и всё, Влада не тронули. А вот двух пацанов со двора — поставили на учёт».`;
    },
    choices: [
        { text: '💬 Расспросить Янчика', next: 'day6_ask_yanchik' },
        { text: '🚶 Пройти мимо', next: 'day6_walk_by' },
        { text: '😤 Пойти к Владу', next: 'day6_confront' }
    ]
},

day6_ask_yanchik: {
    emoji: '💬',
    time: 'day',
    title: 'Разговор',
    text: () => {
        return `«Так всегда, ${g('братан','сестрёнка')}. У богатых — свои правила. Мы тут никто».\n\nЯнчик злится. Ты видишь, как он сжимает кулаки.\n\n«Однажды я тоже стану таким. Только справедливым».\n\nВ это время в конце коридора — **стычка**. Двое пацанов из соседнего двора наехали на одного из шайки Влада.`;
    },
    onEnter: () => {
        stat('intelligence', 1);
    },
    choices: [
        { text: '👊 Смотреть стычку', next: 'day6_fight_watch' },
        { text: '🚶 Уйти', next: 'day6_after_school' }
    ]
},

day6_walk_by: {
    emoji: '🚶',
    time: 'day',
    title: 'Мимо',
    text: () => {
        return `Ты просто проходишь мимо. Уроки идут своим чередом.\n\nНо что-то внутри тебя скрипит. Это несправедливо.`;
    },
    choices: [
        { text: '🏫 После школы', next: 'day6_after_school' }
    ]
},

day6_confront: {
    emoji: '😤',
    time: 'day',
    title: 'К Владу',
    text: () => {
        return `Ты подходишь к Владу: «Слышь, а не стрёмно тебе? Пацанов поставили, а ты в сторонке?»\n\nВлад оборачивается. Улыбка сползает с лица.\n\n«Ты чё, ${g('малой','малая')}, берега ${g('попутал','попутала')}?»`;
    },
    onEnter: () => {
        statEnemy('relationship', -3);
        stat('charisma', 1);
    },
    choices: [
        { text: '💪 Не отступать', next: 'day6_confront_stand' },
        { text: '🙇 Отойти', next: 'day6_confront_back' }
    ]
},

day6_confront_stand: {
    emoji: '💪',
    time: 'day',
    title: 'Держишься',
    text: () => {
        return `Ты не отводишь взгляд. Влад смотрит долго. Пацаны вокруг затихли.\n\n«Ладно, ${g('малой','малая')}. Ты норм. Но не лезь больше».\n\nОн уходит. Янчик рядом шепчет: «Красава. Уважаю».`;
    },
    onEnter: () => {
        stat('charisma', 2);
        stat('happiness', 2);
        dayFlags.stoodUpToVlad = true;
    },
    choices: [
        { text: '🏫 После школы', next: 'day6_after_school' }
    ]
},

day6_confront_back: {
    emoji: '🙇',
    time: 'day',
    title: 'Отступил',
    text: () => {
        return `Ты опускаешь глаза и отходишь. Влад ржёт вслед: «Вот так-то лучше, ${g('малой','малая')}».\n\nЧто-то внутри сжалось. Ты знаешь — надо было стоять.`;
    },
    onEnter: () => {
        stat('happiness', -2);
        statEnemy('relationship', -1);
    },
    choices: [
        { text: '🏫 После школы', next: 'day6_after_school' }
    ]
},

day6_fight_watch: {
    emoji: '👊',
    time: 'day',
    title: 'Стычка',
    decor: 'blood',
    text: () => {
        return `Пацан из соседнего двора бьёт первым. Кровь из носа, крики, учителя бегут.\n\nТебя отталкивают. Ты падаешь на пол. Видишь только ноги, кровь на линолеуме, чью-то разбитую губу.`;
    },
    onEnter: () => {
        stat('happiness', -1);
        dayFlags.sawRealFight = true;
    },
    choices: [
        { text: '🚶 После школы', next: 'day6_after_school' }
    ]
},

day6_after_school: {
    emoji: '🌆',
    time: 'evening',
    title: 'После школы',
    text: () => {
        if (dayFlags.sawRealFight){
            return `Уроки закончились. Ты идёшь домой.\n\nПеред глазами до сих пор — кровь на линолеуме и чья-то разбитая губа.\n\nТы первый раз в жизни чувствуешь злость. Настоящую. Не детскую.`;
        }
        if (dayFlags.stoodUpToVlad){
            return `Уроки закончились. Ты идёшь домой.\n\nТы не отвёл взгляд. Ты стоял. И Влад отступил.\n\nВпервые за долгое время ты чувствуешь — что-то можешь.`;
        }
        return `Уроки закончились. Ты идёшь домой.\n\nВ голове до сих пор звучит: «У богатых свои правила».\n\nТы первый раз в жизни чувствуешь злость. Настоящую. Не детскую.`;
    },
    choices: [
        { text: '🏠 Домой', next: 'day6_home' }
    ]
},

day6_home: {
    emoji: '🏠',
    time: 'evening',
    title: 'Дом',
    text: () => {
        return `Мама встречает тебя ужином. Спрашивает, как дела. Ты говоришь «норм».\n\nНо перед сном ты долго лежишь и думаешь. О Владе, о Янчике, о пацанах, которых поставили на учёт.\n\nМир несправедлив. Но можно ли его изменить?`;
    },
    choices: [
        { text: '😴 Спать', next: 'day6_sleep' }
    ]
},

day6_sleep: {
    emoji: '🌙',
    time: 'night',
    title: 'Ночь',
    text: () => {
        return `Ты засыпаешь поздно. Во сне видишь кровь на линолеуме и почему-то — смеющееся лицо Влада.`;
    },
    choices: [
        { text: '➡️ Следующий день', action: () => { nextDay(); } }
    ]
},

/* ============================================================
   ДЕНЬ 7 — ПОРУЧЕНИЕ КИРИЛЛА
   ============================================================ */

day7_start: {
    emoji: '🌤',
    time: 'morning',
    title: 'Вторник',
    text: () => {
        return `Утро. Ты идёшь в школу. Дорога кажется привычной.\n\nУ ворот школы стоит Кирилл. ${g('Один','Одна')}. Смотрит прямо на тебя.`;
    },
    choices: [
        { text: '🚶 Подойти', next: 'day7_kirill' },
        { text: '🙈 Пройти мимо', next: 'day7_ignore' }
    ]
},

day7_ignore: {
    emoji: '🙈',
    time: 'morning',
    title: 'Мимо',
    text: () => {
        return `Ты опускаешь глаза и проходишь мимо. Кирилл не окликает.\n\nНо ты чувствуешь его взгляд в спину. Что-то внутри шепчет — ты упустил что-то важное.`;
    },
    onEnter: () => {
        storyFlags.missedKirill = true;
    },
    choices: [
        { text: '🏫 В школу', next: 'day7_school' }
    ]
},

day7_kirill: {
    emoji: '🕴',
    time: 'morning',
    title: 'Кирилл',
    text: () => {
        return `Кирилл отходит от ворот, кивает тебе:\n\n«Слышь, ${g('малой','малая')}. Есть дело. Мелкое. Отнести пакет по адресу, на ГАИ. Заберёшь бабки — 500 рублей. По-нормальному. Это не Шальные. Это мои личные дела. Ты как?»\n\nОн смотрит прямо. Без улыбки.`;
    },
    choices: [
        { text: '📦 Согласиться', next: 'day7_agree' },
        { text: '🤔 Спросить, что в пакете', next: 'day7_ask' },
        { text: '🚫 Отказаться', next: 'day7_decline' }
    ]
},

day7_ask: {
    emoji: '🤔',
    time: 'morning',
    title: 'Спросил',
    text: () => {
        return `«А что там?» Кирилл прищуривается:\n\n«Не твоё дело, ${g('малой','малая')}. Либо делаешь, либо нет. Спрашивать — не по-пацански».\n\nОн ждёт ответа.`;
    },
    choices: [
        { text: '📦 Ладно, согласен', next: 'day7_agree' },
        { text: '🚫 Не, я пас', next: 'day7_decline' }
    ]
},

day7_agree: {
    emoji: '📦',
    time: 'evening',
    title: 'Пакет',
    text: () => {
        return `Кирилл даёт тебе пакет — небольшой, заклеенный скотчем. Говорит адрес на ГАИ.\n\nТы идёшь. Сердце колотится. Что там? Может, просто документы? А может, что похуже?\n\nТы звонишь в дверь. Открывает мужик лет 40 в спортивке. Молча берёт пакет. Молча даёт пятихатку. Закрывает дверь.`;
    },
    onEnter: () => {
        money(500);
        stat('happiness', 2);
        stat('charisma', 1);
        storyFlags.tookKirillDeal = true;
    },
    choices: [
        { text: '🏃 Обратно к Кириллу', next: 'day7_return' }
    ]
},

day7_return: {
    emoji: '💼',
    time: 'evening',
    title: 'Обратно',
    text: () => {
        return `Ты возвращаешься. Кирилл ждёт у школы, курит.\n\n«Ну чё?» Ты киваешь. Он хлопает тебя по плечу:\n\n«Красава, ${g('малой','малая')}. Не ${g('обосрался','обосралась')}. В следующий раз будет дело серьёзнее. И бабки серьёзнее».\n\nОн уходит. У тебя в кармане 500 рублей — первые заработанные «не по-детски».`;
    },
    choices: [
        { text: '🏠 Домой', next: 'day7_home' }
    ]
},

day7_decline: {
    emoji: '🚫',
    time: 'evening',
    title: 'Отказался',
    text: () => {
        return `«Не, я пас». Кирилл кивает без эмоций:\n\n«Ну и хуй с тобой. ${g('Малой','Малая')} ещё. Иди учись».\n\nОн уходит. Ты стоишь у ворот. Что-то внутри говорит: ты сделал правильно. Но и что-то другое — ты упустил.`;
    },
    onEnter: () => {
        stat('happiness', 1);
        storyFlags.declinedKirill = true;
    },
    choices: [
        { text: '🏫 В школу', next: 'day7_school' }
    ]
},

day7_school: {
    emoji: '🏫',
    time: 'day',
    title: 'Школа',
    text: () => {
        if (storyFlags.missedKirill){
            return `Обычный учебный день. Контрольная по русскому, потом физра.\n\nТы отвлекаешься. В голове — утренняя встреча. Кирилл ждал тебя. Зачем? Ты не узнал.\n\nЧто дальше?`;
        }
        if (storyFlags.declinedKirill){
            return `Обычный учебный день. Контрольная по русскому, потом физра.\n\nТы отвлекаешься. В голове — Кирилл, пакет, 500 рублей. Ты отказался. Но что-то грызёт изнутри.\n\nЧто дальше?`;
        }
        if (storyFlags.tookKirillDeal){
            return `Обычный учебный день. Контрольная по русскому, потом физра.\n\nТы отвлекаешься. В голове — Кирилл, пакет, 500 рублей. Ты взял. И не уверен, правильно ли.\n\nЧто дальше?`;
        }
        return `Обычный учебный день. Контрольная по русскому, потом физра.\n\nЧто дальше?`;
    },
    choices: [
        { text: '🏫 После школы', next: 'day7_after_school' }
    ]
},

day7_after_school: {
    emoji: '🌆',
    time: 'evening',
    title: 'После школы',
    text: () => {
        if (storyFlags.missedKirill){
            return `Ты выходишь из школы. Первая неделя учебного года закончилась.\n\nТы прошёл мимо Кирилла. Не подошёл. Может, зря, а может — и правильно. Ты не узнаешь.\n\nВпереди — новые дни. Что дальше?`;
        }
        if (storyFlags.tookKirillDeal){
            return `Ты выходишь из школы. Первая неделя учебного года закончилась.\n\nВ кармане — 500 рублей. Первые «взрослые» деньги. Ты ещё не знаешь, что с ними делать.\n\nВпереди — новые дни. Что дальше?`;
        }
        if (storyFlags.declinedKirill){
            return `Ты выходишь из школы. Первая неделя учебного года закончилась.\n\nТы отказался. Сказал «нет». Но кто-то внутри шепчет: а может, зря?\n\nВпереди — новые дни. Что дальше?`;
        }
        return `Ты выходишь из школы. Первая неделя учебного года закончилась.\n\nЧто дальше? Ты пока не знаешь. Но чувствуешь — это только начало.`;
    },
    choices: [
        { text: '🏠 Домой', next: 'day7_home' }
    ]
},

day7_home: {
    emoji: '🏠',
    time: 'evening',
    title: 'Дом',
    text: () => {
        return `Ты заходишь домой. Мама на кухне, что-то готовит.\n\nОна оборачивается: «Как день прошёл?»\n\nТы не знаешь, что сказать. Слишком много всего.`;
    },
    choices: () => {
        const list = [
            { text: '😐 Сказать «норм» и уйти в комнату', next: 'day7_hide_mom' }
        ];
        if (!storyFlags.missedKirill){
            list.unshift({ text: '💬 Рассказать про Кирилла', next: 'day7_tell_mom' });
        }
        return list;
    }
},

day7_tell_mom: {
    emoji: '👩',
    time: 'evening',
    title: 'Разговор с мамой',
    text: () => {
        if (storyFlags.tookKirillDeal){
            return `Ты рассказываешь. Про Кирилла, про пакет, про 500 рублей.\n\nМама бледнеет. Кладёт ложку. Садится напротив.\n\n«${player.name}, послушай меня внимательно. Я всю жизнь работаю на заводе за копейки. И знаешь что? Лучше так, чем через чужое. Эти люди — они не друзья. Они используют. Сегодня пакет, завтра — срок. Понимаешь?»\n\nОна смотрит тебе в глаза.`;
        }
        if (storyFlags.declinedKirill){
            return `Ты рассказываешь. Про Кирилла — как он ждал у школы, как предлагал «дело». Как ты отказался.\n\nМама слушает молча. Потом кивает:\n\n«Правильно. Я всю жизнь работаю на заводе за копейки. И знаешь что? Лучше так, чем через чужое. Эти люди — они не друзья. Они используют. Ты ${g('сделал','сделала')} правильно, что ${g('отказался','отказалась')}».\n\nОна смотрит тебе в глаза.`;
        }
        return `Ты рассказываешь про день. Про школу, про пацанов. Про то, что чувствуешь — что-то меняется.\n\nМама слушает молча. Потом говорит:\n\n«Я всю жизнь работаю на заводе за копейки. И знаешь что? Лучше так, чем через чужое. Не лезь туда, где тебе не место. Понимаешь?»\n\nОна смотрит тебе в глаза.`;
    },
    onEnter: () => {
        statMom('relationship', 2);
        if (storyFlags.tookKirillDeal) {
            stat('happiness', -1);
        } else {
            stat('happiness', 1);
        }
    },
    choices: [
        { text: '🤝 Понял, мама', next: 'day7_sleep' },
        { text: '😐 Промолчать', next: 'day7_silent_mom' }
    ]
},

day7_silent_mom: {
    emoji: '👩',
    time: 'evening',
    title: 'Молчание',
    text: () => {
        return `Ты молчишь. Мама вздыхает, отворачивается к плите.\n\n«Ладно. Иди уроки делай».\n\nЧто-то между вами треснуло. Может, на время. Может, навсегда.`;
    },
    onEnter: () => {
        statMom('relationship', -1);
    },
    choices: [
        { text: '😴 Спать', next: 'day7_sleep' }
    ]
},

day7_hide_mom: {
    emoji: '🚪',
    time: 'evening',
    title: 'В комнату',
    text: () => {
        if (storyFlags.tookKirillDeal){
            return `Ты уходишь в комнату. Закрываешь дверь. Садишься на кровать.\n\nВ кармане — 500 рублей. Первые заработанные «не по-детски».\n\nТы смотришь в потолок. Первая неделя школы закончилась. А кажется — прошла целая жизнь.`;
        }
        if (storyFlags.declinedKirill){
            return `Ты уходишь в комнату. Закрываешь дверь. Садишься на кровать.\n\nВ кармане пусто. Ты ${g('отказался','отказалась')} — и правильно. Но что-то грызёт изнутри.\n\nТы смотришь в потолок. Первая неделя школы закончилась.`;
        }
        if (storyFlags.missedKirill){
            return `Ты уходишь в комнату. Закрываешь дверь. Садишься на кровать.\n\nТы прошёл мимо Кирилла. Не подошёл. Что он хотел — ты уже не узнаешь.\n\nТы смотришь в потолок. Первая неделя школы закончилась.`;
        }
        return `Ты уходишь в комнату. Закрываешь дверь. Садишься на кровать.\n\nТы смотришь в потолок. Первая неделя школы закончилась. А кажется — прошла целая жизнь.`;
    },
    onEnter: () => {
        stat('happiness', -1);
    },
    choices: [
        { text: '😴 Спать', next: 'day7_sleep' }
    ]
},

day7_sleep: {
    emoji: '🌙',
    time: 'night',
    title: 'Конец первой недели',
    text: () => {
        let line = '';
        if (storyFlags.tookKirillDeal) {
            line = `Ты ${g('взял','взяла')} первые «взрослые» деньги. И уже не уверен, что сможешь остановиться.`;
        } else if (storyFlags.declinedKirill) {
            line = `Ты ${g('отказался','отказалась')}. Пока. Но Кирилл запомнил тебя — и это не конец.`;
        } else if (storyFlags.missedKirill) {
            line = 'Ты прошёл мимо. Что было бы, если бы подошёл — уже не узнать.';
        } else {
            line = `Ты так и не ${g('понял','поняла')}, что это было. Но что-то внутри изменилось.`;
        }

        return `Ты ложишься спать. За окном темно. Звёзды горят.\n\n${line}\n\nТебе 10 лет. Впереди — целая жизнь.\n\nПервый акт окончен.`;
    },
    choices: [
        { text: '➡️ Дальше', action: () => { nextAct(); } }
    ]
}

}; // конец act1Nodes
