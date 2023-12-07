import {Entity} from "./Entity.js";
import {Sword} from "./Sword.js";

export class Player extends Entity {
    name = "Player";
    max_health = 100;
    health = 100;
    damage = 30;
    attackDelay = 10;
    currentDelay = 0;
    direct_x;
    direct_y;
    speed = 5;
    key = false;
    swordUpgrade = false;

    sprite_speed = 9;
    curr_sprite = 0;
    num_sprite = 4;

    constructor(id, physicManager, soundManager) {
        super(id, physicManager, soundManager);
    }

    draw(spriteManager, ctx) {
        let x = this.direct_x;
        let y = this.direct_y;

        ctx.save();
        ctx.translate(this.pos_x, this.pos_y);
        if (x === -1 || y === -1) {
            ctx.scale(-1, 1);
        }

        spriteManager.drawSprite(ctx, "p_" + this.curr_sprite, 0, 0);
        ctx.restore();
    }

    update() {
        this.move_x = 0;
        this.move_y = 0;
        if (this.eventsManager.action['up']) this.move_y = -1;
        if (this.eventsManager.action['down']) this.move_y = 1;
        if (this.eventsManager.action['left']) this.move_x = -1;
        if (this.eventsManager.action['right']) this.move_x = 1;
        this.attack(this.eventsManager.action['attack']);

        if (this.move_x + this.move_y !== 0) {
            if (Math.abs(this.direct_x + this.move_x) === 1) {
                [this.size_x, this.size_y] = [this.size_y, this.size_x]
            }
            this.direct_x = this.move_x;
            this.direct_y = this.move_y;
        }
        if (this.move_x !== 0 || this.move_y !== 0) {
            this.update_sprite_walk();
        } else {
            this.update_sprite_stay();
        }

        this.physicManager.update(this);
    }

    update_sprite_walk() {
        this.curr_sprite++;
        if (this.curr_sprite >= this.num_sprite) {
            this.curr_sprite = 0;
        }
    }

    update_sprite_stay() {
        if (--this.sprite_speed > 0) {
            return;
        }
        if (this.health !== 0) this.curr_sprite++;
        if (this.curr_sprite >= this.num_sprite) {
            this.curr_sprite = 0;
        }
        this.sprite_speed = 9;
    }

    onTouchEntity(obj) {
        if (obj.name === "SpeedPotion") {
            this.incSpeed(obj.value);
            this.soundManager.play("potion.mp3");
            obj.kill();
        }
        if (obj.name === "HealingPotion") {
            this.incHealth(obj.value);
            this.soundManager.play("potion.mp3");
            obj.kill();
        }
        if (obj.name === "SwordUpgrade") {
            this.upgradeSword(obj.value);
            this.soundManager.play("sword_upgrade.wav");
            obj.kill();
        }
        if (obj.name === "Key") {
            this.key = true;
            this.soundManager.play("key.mp3");
            obj.kill();
        }
        if (obj.name === "Door" && this.key) {
            this.key = false;
            this.soundManager.play("open_door.mp3");
            obj.kill();
        }
        if (obj.name === "Exit") {
            this.soundManager.play("exit.mp3");
            this.physicManager.gameManager.score += 200;
            this.physicManager.gameManager.gameOver(true);
        }
    }

    kill() {
        if (this.physicManager.gameManager.game_end === true) {
            return;
        }

        this.physicManager.gameManager.kill(this);
        this.physicManager.gameManager.player = null;
        this.physicManager.gameManager.gameOver(false);
    }

    attack(bool_act) {
        if (!(this.currentDelay === 0 && bool_act === true)) {
            if (this.currentDelay !== 0) {
                this.currentDelay -= 1
            }
            return;
        }
        this.soundManager.play("attack.mp3");

        let s = new Sword(this.physicManager.gameManager.genIdObj(), this.physicManager, this.soundManager);
        s.belongTo = this.name;
        s.damage = this.damage;
        s.move_x = this.direct_x;
        s.move_y = this.direct_y;

        switch (s.move_x + 2 * s.move_y) {
            case -1: // выстрел влево
                s.pos_x = this.pos_x - s.size_x - Math.floor(this.size_x / 2) - 5;
                s.pos_y = this.pos_y;
                break;
            case 1: // выстрел вправо
                s.pos_x = this.pos_x + s.size_x + Math.floor(this.size_x / 2) + 5;
                s.pos_y = this.pos_y;
                break;
            case -2: // выстрел вверх
                s.pos_x = this.pos_x;
                s.pos_y = this.pos_y - Math.floor((s.size_y + this.size_y) / 2) - 4;
                break;
            case 2: // выстрел вниз
                s.pos_x = this.pos_x;
                s.pos_y = this.pos_y + s.size_y + Math.floor(this.size_y / 2) + 4;
                break;
            default:
                return;
        }

        this.currentDelay = this.attackDelay;
        this.physicManager.gameManager.entities.push(s);
    }

    upgradeSword(value) {
        this.swordUpgrade = value;
    }

    incSpeed(value) {
        this.speed += value;
    }

    incHealth(value) {
        this.health += value;
        if (this.health > this.max_health) {
            this.health = this.max_health;
        }
    }

    decHealth(value) {
        this.health -= value;
        if (this.health <= 0) {
            this.kill();
        }
    }
}