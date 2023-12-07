import {Entity} from "./Entity.js";
import {Sword} from "./Sword.js";

export class Skeleton extends Entity {
    name = "Skeleton";
    health = 75
    damage = 10;
    attackDelay = 15;
    currentDelay = 0;
    direct_x;
    direct_y;
    speed = 2;
    drt_player = null;

    sprite_speed = 7;
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

        spriteManager.drawSprite(ctx, "s_" + this.curr_sprite, 0, 0);
        ctx.restore();
    }

    checkPlayer(player) {
        if (player === null) {
            return null
        }

        let p_x = player.pos_x;
        let p_y = player.pos_y;

        let x_l = this.pos_x - Math.floor(this.size_x / 2);
        let x_r = this.pos_x + Math.floor(this.size_x / 2);
        let y_u = this.pos_y - Math.floor(this.size_y / 2);
        let y_d = this.pos_y + Math.floor(this.size_y / 2);

        let drt_x = 0;
        let drt_y = 0;

        let mapManager = this.physicManager.gameManager.mapManager;

        if (p_x <= x_r && p_x >= x_l) {
            if (p_y < this.pos_y) {
                drt_y = -1;
            } else {
                drt_y = 1;
            }

            for (let curr_y = this.pos_y; drt_y * curr_y < drt_y * p_y; curr_y = curr_y + drt_y * 32) {
                if (mapManager.getTilesetIdx(this.pos_x, curr_y, "walls") !== 0) return false;
            }
        }

        if (p_y <= y_d && p_y >= y_u) {
            if (p_x < this.pos_x) {
                drt_x = -1;
            } else {
                drt_x = 1;
            }
            for (let curr_x = this.pos_x; drt_x * curr_x < drt_x * p_x; curr_x = curr_x + drt_x * 32) {
                if (mapManager.getTilesetIdx(curr_x, this.pos_y, "walls") !== 0) return false;
            }

        }

        if (drt_x === 0 && drt_y === 0) {
            return null;
        }

        return {x: drt_x, y: drt_y};
    }

    update() {
        this.drt_player = this.checkPlayer(this.physicManager.gameManager.player)
        if (this.drt_player) {

            this.direct_x = this.drt_player.x;
            this.direct_y = this.drt_player.y;

            this.speed = 4;
            this.update_sprite_walk();
            this.attack();
        } else {
            this.speed = 2;
            this.update_sprite_stay();
        }

        this.move_x = this.direct_x;
        this.move_y = this.direct_y;

        this.physicManager.update(this);
    }

    update_sprite_stay() {
        if (--this.sprite_speed > 0) {
            return;
        }
        if (this.health !== 0) this.curr_sprite++;
        if (this.curr_sprite >= this.num_sprite) {
            this.curr_sprite = 0;
        }
        this.sprite_speed = 7;
    }

    update_sprite_walk() {
        this.curr_sprite++;
        if (this.curr_sprite >= this.num_sprite) {
            this.curr_sprite = 0;
        }
    }

    onTouchMap(idx) {
        if (this.direct_x !== 0 && this.drt_player === null) {
            this.direct_x *= -1;
        }
        if (this.direct_y !== 0 && this.drt_player === null) {
            this.direct_y *= -1;
        }
    }

    onTouchEntity(obj) {

    }

    decHealth(value) {
        this.health -= value;
        if (this.health <= 0) {
            this.kill();
        }
    }

    attack() {
        if (!(this.currentDelay === 0)) {
            if (this.currentDelay !== 0) {
                this.currentDelay -= 1
            }
            return;
        }
        this.soundManager.play("skeleton_attack.mp3");

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
                s.pos_y = this.pos_y - Math.floor((s.size_y + this.size_y) / 2) - 5;
                break;
            case 2: // выстрел вниз
                s.pos_x = this.pos_x;
                s.pos_y = this.pos_y + s.size_y + Math.floor(this.size_y / 2) + 5;
                break;
            default:
                return;
        }

        this.currentDelay = this.attackDelay;
        this.physicManager.gameManager.entities.push(s);
    }

    kill() {
        this.physicManager.gameManager.kill(this);
        this.physicManager.gameManager.score += 100;
        this.physicManager.gameManager.n_enemy--;
    }
}