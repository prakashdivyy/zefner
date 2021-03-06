import Sword from "../weapon/Sword";
import Commander from "../commander/Commander";
import HitReport from "../data/HitReport";
import Request from '../data/Request';
import {setInterval} from "timers";

/**
 * Zefner, The Knight. Attack and stress load your HTTP's endpoint.
 */
export default class Zefner<T extends Request> {
    private sword: Sword<T>;
    private commander: Commander<T>;
    private request: T;
    private hitCount: number;

    /**
     * Must be called first, set what sword will be used by Zefner.
     * @param {Sword<T extends Request>} sword
     * @returns {this<T extends Request>}
     */
    use(sword: Sword<T>) {
        this.sword = sword;
        return this;
    }

    /**
     * Used to define the commander whom Zefner will report to.
     * @param {Commander<T extends Request>} commander
     * @returns {this<T extends Request>}
     */
    reportTo(commander: Commander<T>) {
        this.commander = commander;
        return this;
    }

    /**
     * Specify the target to hit (does not actually execute the attack until you call charge()).
     * @param {T} request
     * @returns {this<T extends Request>}
     */
    hit(request: T) {
        this.request = request;
        return this;
    }

    /**
     * How many times should Zefner try to attack the target.
     * @param {number} count
     * @returns {this<T extends Request>}
     */
    times(count: number) {
        this.hitCount = count;
        return this;
    }

    /**
     * Launch the attack.
     */
    charge() {
        this.commander.onStart();
        let iteration = 1;
        let refCounter = this.hitCount;
        while (this.hitCount > 0) {
            // The request is sent asynchronously, when it finish really depends, so the hit iteration
            // on the commander won't be sequential.
            this.sword.hit(iteration, this.request).then((data) => {
                this.commander.onHit(data);
                refCounter--;
            }).catch((data) => {
                this.commander.onFail(data);
                refCounter--;
            });
            this.hitCount--;
            iteration++;
        }

        // Is there a better alternative than this?
        const waitId = setInterval(() => {
            if (refCounter <= 0) {
                clearInterval(waitId);
                this.commander.onEnd();
            }
        }, 1);
    }

}