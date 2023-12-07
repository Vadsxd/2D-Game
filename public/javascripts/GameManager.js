import {Player} from "./Entities/Player.js";
import {Flag} from "./Entities/Flag.js";
import {Torch} from "./Entities/Torch.js";
import {SideTorch} from "./Entities/SideTorch.js";
import {SpeedPotion} from "./Entities/SpeedPotion.js";
import {Sword} from "./Entities/Sword.js";
import {Skeleton} from "./Entities/Skeleton.js";
import {Ember} from "./Entities/Ember.js";
import {FlameBullet} from "./Entities/FlameBullet.js";
import {FlameTrap} from "./Entities/FlameTrap.js";
import {Key} from "./Entities/Key.js";
import {Door} from "./Entities/Door.js";
import {Exit} from "./Entities/Exit.js";
import {HealingPotion} from "./Entities/HealingPotion.js";
import {SwordUpgrade} from "./Entities/SwordUpgrade.js";

import {MapManager} from "/javascripts/MapManager.js";
import {SpriteManager} from "/javascripts/SpriteManager.js";
import {PhysicManager} from "/javascripts/PhysicManager.js";
import {SoundManager} from "/javascripts/SoundManager.js";
import {EventManager} from "/javascripts/EventManager.js";

export class GameManager {
    factory = {};
    entities = [];
    idCount = 0;
    player = null;
    laterKill = [];
    game_end = false;
    f_win;
    size_map = {x: null, y: null};
    map_loaded = false;
    level = 1;
    max_level = 2;
    n_enemy = 0;
    score = 0;
    player_name = localStorage["username"];
    data_score;

    sounds = ["attack.mp3", "sceleton_hit.mp3", "ember_hit.mp3", "key.mp3", "potion.mp3", "open_door.mp3",
    "exit.mp3", "fireball.mp3", "flame_trap.mp3", "bg.mp3", "sword_upgrade.wav", "skeleton_attack.mp3"];

    constructor(canvas, level) {
        document.getElementById('name_player').textContent = localStorage.getItem("username");
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.factory['Player'] = Player;
        this.factory['Sword'] = Sword;
        this.factory['Skeleton'] = Skeleton;
        this.factory['Ember'] = Ember;
        this.factory['FlameBullet'] = FlameBullet;
        this.factory['Flag'] = Flag;
        this.factory['Torch'] = Torch;
        this.factory['SideTorch'] = SideTorch;
        this.factory['SpeedPotion'] = SpeedPotion;
        this.factory['HealingPotion'] = HealingPotion;
        this.factory['SwordUpgrade'] = SwordUpgrade;
        this.factory['FlameTrap'] = FlameTrap;
        this.factory['Key'] = Key;
        this.factory['Door'] = Door;
        this.factory['Exit'] = Exit;
        this.eventsManager = new EventManager();

        this.soundManager = new SoundManager();
        this.soundManager.loadArray(this.sounds);
        this.soundManager.play("bg.mp3", {looping: true});

        this.loadLevel(level);
        this.spriteManager = new SpriteManager();
        this.loadScore();
    }

    loadScore() {
        const path = `/asset/score.json`;
        const request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200) {
                this.data_score = JSON.parse(request.responseText);
            }
        };
        request.open('GET', path, true);
        request.send();
    }

    updateScore() {
        const path = `/asset/score.json`;
        const request = new XMLHttpRequest();
        request.open('POST', path, true);
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(this.data_score));
    }

    loadLevel(level = 1) {
        document.getElementById('level').textContent = String(level);
        this.map_loaded = false;

        this.entities = [];
        this.player = null;
        this.n_enemy = 0;

        this.mapManager = new MapManager(level, this.canvas);
        this.size_map = this.mapManager.getSizeMap();
        this.physicManager = new PhysicManager(this, this.mapManager);
        this.mapManager.draw(this.ctx);
        this.mapManager.drawOverLayer(this.ctx);
        this.mapManager.parseEntities(this, this.physicManager, this.soundManager);
    }

    update() {
        if (this.map_loaded === false) {
            return;
        }

        //обновление данных GUI
        document.getElementById('score').textContent = String(this.score);
        if (this.player !== null) {
            document.getElementById('HP').textContent = String(this.player.health);
            document.getElementById('DMG').textContent = String(this.player.damage);
            document.getElementById('speed').textContent = String(this.player.speed);
        } else {
            document.getElementById('HP').textContent = "0";
        }

        // обновление всех объектов
        this.entities.forEach((e) => {
            try {
                e.update();
            } catch (ex) {
                console.log(ex);
            }
        });

        // удаление мертвых
        for (let i = 0; i < this.laterKill.length; i++) {
            const idx = this.entities.indexOf(this.laterKill[i]);
            if (idx > -1) {
                this.entities.splice(idx, 1);
            }
        }

        if (this.laterKill.length > 0) {
            this.laterKill.length = 0;
        }

        this.mapManager.draw(this.ctx);
        this.drawObj(this.ctx);
        this.mapManager.drawOverLayer(this.ctx);

        if(this.game_end === true){
            this.showEndText(this.f_win);
        }
    }

    genIdObj() {
        return this.idCount++;
    }

    drawObj() {
        for (let e = 0; e < this.entities.length; e++) {
            this.entities[e].draw(this.spriteManager, this.ctx);
        }
    }

    play() {
        setInterval(this.update.bind(this), 100);
    }

    initPlayer(obj) {
        this.player = obj;
        this.player.eventsManager = this.eventsManager;
    }

    kill(obj) {
        this.laterKill.push(obj);
    }

    printText(text, size, x, y, lineWidth) {
        let ctx = this.ctx;

        ctx.save();
        ctx.font = size + "px monospace";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 1;
        ctx.lineWidth = lineWidth;
        ctx.strokeText(text, x, y);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    newLevel() {
        document.body.removeEventListener('keydown', this.func);
        this.eventsManager.addEventListener();
        this.game_end = false;

        this.loadLevel(this.level);
    }

    showEndText(f_win) {
        if (f_win === false) {
            this.printText("You Lost", 50, this.size_map.x / 2 - 4 * 32 + 16, this.size_map.y / 2 - 2 * 32, 4);
        } else {
            this.printText("Level Complete", 40, this.size_map.x / 2 - 3 * 32, this.size_map.y / 2 - 2 * 32, 4);
        }

        this.printText("Press to play", 25, this.size_map.x / 2 - 3 * 32, this.size_map.y / 2, 2);
    }


    gameOver(f_win) {
        this.f_win = f_win;
        this.game_end = true;

        if (!this.data_score[this.player_name] || this.data_score[this.player_name] < this.score) {
            this.data_score[this.player_name] = this.score;
        }

        this.updateScore();

        if (f_win === false) {
            this.level = 1;
            this.score = 0;
        } else {
            this.level++;
            if (this.level > this.max_level) {
                this.level = 1;
            }
        }

        this.eventsManager.removeEventListener();
        this.eventsManager.clearAction();
        this.func = this.newLevel.bind(this);
        setTimeout(this.eventsManager.onPressDo.bind(), 2000, this.func);
    }
}