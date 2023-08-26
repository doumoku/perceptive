import {GeometricUtils} from "./GeometricUtils.js";
import {cModuleName} from "./PerceptiveUtils.js";

const cisPerceptiveWall = "isPerceptiveWallFlag";
const cisPerceptiveWallstring = '{"' + cModuleName + '" : {"' + cisPerceptiveWall + '" : "true"}}';
const cisPerceptiveWallData = JSON.parse(cisPerceptiveWallstring);

class WallUtils {
	//IMPLEMENTATIONS
	//basics
	static isLocked(pDoor) {} //returns of pDoor is locked
	
	static isDoor(pWall) {} //returns if pWall is door
	
	static isOpened(pDoor) {} //returns of pDoor is locked
	
	static async closeDoor(pDoor) {} //closes (not locks) door
	
	static async openDoor(pDoor) {} //open pDoor
	
	static deletewall(pWall) {} //deletes pWall (only if it is a perceptive wall)
	
	static hidewall(pWall) {} //makes sure, that pWall has no restrictions
	
	static async createperceptivewall(pScene, pPosition, pSetting = {move : 20, sight : 20, light : 20, sound : 20}, pRenderable = true) {} //created a new wall
	
	static async clonedoorasWall(pDoor, pRenderable = true) {} //creates copy of pDoor as wall
	
	static async syncWallfromDoor(pDoor, pWall, pincludeposition = true) {} //synchs the setting of pWall to that of pDoor
	
	//calculations
	static cornerposition(pWallPosition) {} //returns the corners of pWallPosition
	
	static wallposition(pCornerA, pCornerB) {} //returns the wall position belonging to the corners
	
	static calculateSlide(pOriginalPosition, pSlideState) {} //returns a new position of wall, pSlideState is a 2d-array discribing the percentage of the left and right point
	
	static calculateSwing(pOriginalPosition, pSwingState, phinge) {} //returns a new position of wall, phinge is corner around which pSwing is applied
	
	//DECLARATIONS
	//basics
	static isLocked(pDoor) {
		return pDoor.ds == 2;
	}
	
	static isDoor(pWall) {
		return pWall.door == 1;
	}
	
	static isOpened(pDoor) {
		return pDoor.ds == 1;
	}
	
	static async closeDoor(pDoor) {
		await pDoor.update({ds : 0}, {PerceptiveChange : true});
	}
	
	static async openDoor(pDoor) {
		await pDoor.update({ds : 1}, {PerceptiveChange : true});
	}
	
	static deletewall(pWall) {
		if (pWall.flags && pWall.flags[cModuleName] && pWall.flags[cModuleName][cisPerceptiveWall]) {
			pWall.delete();
		}
	}
	
	static hidewall(pWall) {
		pWall.update({move : 0, sight : 0, light : 0, sound : 0});
	} 
	
	static async createperceptivewall(pScene, pPosition, pSetting = {move : 20, sight : 20, light : 20, sound : 20}, pRenderable = true) {
		let vSettings = {...pSetting};
		
		vSettings["c"] = pPosition;
		
		vSettings["flags"] = cisPerceptiveWallData;
		
		vSettings["renderable"] = pRenderable;
		
		return await WallDocument.createDocuments([vSettings], {parent : pScene});
	}
	
	static async clonedoorasWall(pDoor, pRenderable = true) {
		let vData = {...pDoor};
		
		vData["door"] = 0;
		
		return (await WallUtils.createperceptivewall(pDoor.parent, pDoor.c, vData, pRenderable))[0];
	}
	
	static async syncWallfromDoor(pDoor, pWall, pincludeposition = true) {
		let vData = {...pDoor};
		
		if (!pincludeposition) {
			delete vData.c;
		}
		
		//delete some stuff
		delete vData._object;
		delete vData.flags;
		delete vData.ds;
		delete vData._destroyed;
		delete vData.doorSound;
		delete vData.door;
		
		await pWall.update(vData, {PerceptiveChange : true});
	}
	
	//calculations
	static cornerposition(pWallPosition) {
		return [[pWallPosition[0], pWallPosition[1]],[pWallPosition[2], pWallPosition[3]]];
	}
	
	static wallposition(pCornerA, pCornerB) {
		return [pCornerA[0], pCornerA[1], pCornerB[0], pCornerB[1]];
	}
	
	static calculateSlide(pOriginalPosition, pSlideState, phinge) {
		let vOriginalState = WallUtils.cornerposition(pOriginalPosition);
		
		let vWallLine = GeometricUtils.Difference(vOriginalState[1], vOriginalState[0]);
		
		switch (Number(phinge)) {
			case 0:
				return WallUtils.wallposition(vOriginalState[0], GeometricUtils.Summ(vOriginalState[0], GeometricUtils.scale(vWallLine, pSlideState)));
				break;
			case 1:
				return WallUtils.wallposition(GeometricUtils.Summ(vOriginalState[1], GeometricUtils.scale(vWallLine, -pSlideState)), vOriginalState[1]);
				break;
			default:
				return pOriginalPosition;
		}
	}
	
	static calculateSwing(pOriginalPosition, pSwingState, phinge) {
		let vOriginalState = WallUtils.cornerposition(pOriginalPosition);
		
		let vWallLine = GeometricUtils.Difference(vOriginalState[1], vOriginalState[0]);
		
		switch (Number(phinge)) {
			case 0:
				return WallUtils.wallposition(vOriginalState[0], GeometricUtils.Summ(vOriginalState[0], GeometricUtils.Rotated(vWallLine, pSwingState)));
				break;
			case 1:
				return WallUtils.wallposition(GeometricUtils.Summ(vOriginalState[1], GeometricUtils.Rotated(GeometricUtils.scale(vWallLine, -1), pSwingState)), vOriginalState[1]);
				break;
			default:
				return pOriginalPosition;
		}
	}
}

export {WallUtils, cisPerceptiveWall}