import {Entity} from "./Entity.js";

export class Sword extends Entity {
    name = "Sword";
    damage;
    move_x;
    move_y;
    size_x = 6;
    size_y = 10;
    speed = 7;

    constructor(id, physicManager, soundManager) {
        super(id, physicManager, soundManager);
    }

    draw(spriteManager, ctx) {
        ctx.save();
        ctx.translate(this.pos_x, this.pos_y);
        ctx.rotate(-(Math.PI/2) * (1 + this.move_y + this.move_x * (this.move_x + 1)));

        spriteManager.drawSprite(ctx, 'sword', 0, 0);
        ctx.restore();
    }

    update() {
        this.physicManager.update(this);
        if (this.belongTo === "Skeleton") {
            this.kill();
            return;
        }
        if (!this.physicManager.gameManager.player.swordUpgrade) {
            this.kill();
        }
    }

    onTouchEntity(entity) {
        if (entity.name === "Skeleton" || entity.name === "Player" || entity.name === "Ember") {
            entity.decHealth(this.damage);
        }

        if (entity.name === "Skeleton") {
            this.soundManager.play("sceleton_hit.mp3");
        }

        if (entity.name === "Ember") {
            this.soundManager.play("ember_hit.mp3");
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