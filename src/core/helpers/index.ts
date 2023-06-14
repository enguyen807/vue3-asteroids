import { type Ref } from 'vue';


/**
* handleCentreDot - sets the middle of the ship
* @return void;
*/
export const handleCentreDot = (ctx: Ref, x: number, y: number): void => {
   ctx.value!.fillStyle = "red";
   ctx.value!.fillRect(x - 1, y - 1, 2, 2);
}

/**
 * handleShowBounding - show boundary of object
 * @return void;
 */
export const handleShowBounding = (ctx: Ref, x: number, y: number, r:number): void => {
      ctx.value!.strokeStyle = "lime";
      ctx.value!.beginPath();
      ctx.value!.arc(x, y, r, 0, Math.PI * 2, false);
      ctx.value!.stroke()
}