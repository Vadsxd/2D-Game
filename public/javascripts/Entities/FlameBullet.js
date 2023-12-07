import {Entity} from "./Entity.js";

export class FlameBullet extends Entity {
    name = "FlameBullet";
    damage;
    move_x;
    move_y;
    size_x = 6;
    size_y = 6;
    speed = 6;

    curr_sprite = 0;
    num_sprite = 4;

    constructor(id, physicManager, soundManager) {
        super(id, physicManager, soundManager);
    }

    draw(spriteManager, ctx) {
        spriteManager.drawSprite(ctx, 'fb_' + this.curr_sprite, this.pos_x, this.pos_y);
    }

    update() {
        this.curr_sprite++;
        if(this.curr_sprite >= this.num_sprite){
            this.curr_sprite = 0;
        }

        this.physicManager.update(this);
    }

    onTouchEntity(entity) {
        if (entity.name === "Player") {
            entity.decHealth(this.damage);
        }

        this.kill();
    }

    onTouchMap() {
        this.kill();
    }

    kill() {
        this.physicManager.gameManager.kill(this);
    }
}