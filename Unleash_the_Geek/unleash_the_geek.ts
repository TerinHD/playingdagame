// List of Improvements

/*

1. Update Traps so if they go off... we can dig there again
2. Update Radars/MapPos so if they get removed we don't lose knowledge of ore being there


*/

class Entity {
    id: string;
    xPos: number;
    yPos: number;
    
    constructor( id: string, xPos: number, yPos: number ) {
        this.id = id;
        this.xPos = xPos;
        this.yPos = yPos;
    }
    
    public updatePos( x:number, y:number) {
        this.xPos = x;
        this.yPos = y;
    }
};

class Bot extends Entity {
    item: number;
    xLastPos: number;
    yLastPos: number;
    xTargetPos: number = -1;
    yTargetPos: number = -1;
    xDigPos: number = -1;
    yDigPos: number = -1;
    action: string;
    previousActionDig: boolean = false;
    previousActionRequestRadar: boolean = false;
    stoodStillLastTurn: boolean = false;
    constructor( id: string, xPos: number, yPos: number, item: number) {
        super(id, xPos, yPos);
        this.item = item;
    }
    
    public update( x: number, y:number, item:number) {
        this.xPos = x;
        this.yPos = y;
        this.item = item;
        
        if(this.previousActionDig && this.item === 4) {
            let key: string = "Pos-" + this.xDigPos + "-" + this.yDigPos;
            let mapPosition = map.get(key);
            mapPosition.previousDigFoundOre = true;
            if(!hasOreArray.includes(mapPosition)) {
                hasOreArray.push(mapPosition);
                if(!radarPotentialPlacementArray.includes(mapPosition)) {
                    radarPotentialPlacementArray.push(mapPosition);
                }
            }
            
            removeFromArray(mapPosition, unexploredArray);
            removeFromArray(mapPosition, unexploredBufferArray);
            
        } else if( this.previousActionDig && this.item === -1) {
            let key: string = "Pos-" + this.xDigPos + "-" + this.yDigPos;
            let mapPosition = map.get(key);
            mapPosition.noOreLeft = true;
            if(!noOreLeftArray.includes(mapPosition)) {
                noOreLeftArray.push(mapPosition);
            }
            
            removeFromArray(mapPosition, hasOreArray);
            removeFromArray(mapPosition, unexploredArray);
            removeFromArray(mapPosition, unexploredBufferArray);
            removeFromArray(mapPosition, radarPotentialPlacementArray);
        } 
        
        if( this.previousActionDig ) {
            let key: string = "Pos-" + this.xDigPos + "-" + this.yDigPos;
            let mapPosition = map.get(key);
            this.xDigPos = -1;
            this.yDigPos = -1;  
        }
        
        if( this.previousActionRequestRadar && this.item === 2 && radarRequester === this.id ) {
            radarRequester = "";
        }
            
        this.previousActionRequestRadar = false;
        this.previousActionDig = false;    
    }
};

class MapPos extends Entity {
    oreCount: number;
    oreValueKnown: boolean;
    holeExists: boolean = false;
    positionClaimed:  boolean;
    noOreLeft: boolean = false; // False = unknown, true = dug no ore found
    previousDigFoundOre: boolean = false; // False means unknown, true means previous dig found ore here
    weDugThisHole: boolean = false; // False means unknown, true means we dug it
    isTrapped: boolean = false; // False means not our trap, true means we trapped it
    
    constructor(id:string, oreValueKnown: boolean, holeExists: boolean, oreCount: number, xPos: number, yPos: number) {
        super(id, xPos, yPos);
        this.oreCount = oreCount;
        this.oreValueKnown = oreValueKnown;
        this.holeExists = holeExists;
    }
};


function calculateAction( bot: Bot,  radarCooldown: number, trapCooldown: number): void {
    bot.action = "WAIT";
    
    // console.error(" Bot: " + bot.id + " radarCooldown: " + radarCooldown + " radarRequester: " + radarRequester + " botItem: " + bot.item + " isValidRadarLocation: " + isValidRadarLocation );
    if( bot.xPos === 0 && radarCooldown === 0 && bot.item === -1 && (!radarClaimed  || bot.id === radarRequester) && isValidRadarLocation && (hasOreArray.length < 15)) {
        if(radarRequester !== "" && radarRequester !== bot.id ) {
            reCalcBotArray.push(myBots.get(radarRequester));
        }
        radarRequester = bot.id;
        bot.previousActionRequestRadar = true;
        radarClaimed = true;
        bot.action = "REQUEST RADAR";
    } else if( bot.xPos === 0 && trapCooldown === 0 && bot.item === -1 && !trapClaimed && Math.floor(Math.random() * 4) === 0) {
        trapClaimed = true;
        bot.action = "REQUEST TRAP";
    } else if( bot.item === 4 ) {
        bot.action = "MOVE 0 " + bot.yPos;
    } else if( radarCooldown === 0 && bot.item === -1 && (bot.xTargetPos === -1 && bot.yTargetPos === -1) && (radarRequester === bot.id || radarRequester === "" && isValidRadarLocation) && (hasOreArray.length < 5) ) {
        radarRequester = bot.id;
        bot.previousActionRequestRadar = true;
        bot.action = "REQUEST RADAR";
    } else if( bot.item === 3 ) { // It has a trap...
        // Determine move or drop...
        bot.action = calculateTrapLocation( bot );
    } else if( bot.item === 2 ) { // It has a radar...
        bot.action = calculateRadarLocation( bot );
    } else if( bot.item === -1 ) {
        bot.action = calculateMoveOrDigEmpty( bot );
    }
    
    updateBot(bot);
}

function calculateTrapLocation( bot: Bot ): string {
    if( bot.xTargetPos !== -1 && bot.yTargetPos !== -1 ) {
        let atTarget = isBotAtTargetLocation( bot );
        if( isTargetATrap(bot) || hasNoOre(bot) || (isRiskyOre(bot) && ( unexploredBufferArray.length !== 0 || unexploredArray.length !== 0 || hasOreArray.length !== 0)) ) { 
            bot.xTargetPos = -1;
            bot.yTargetPos = -1;
            return calculateTrapLocation( bot );
        } else if( atTarget ) {
            return setDig(bot);
        }
        return "MOVE " + bot.xTargetPos + " " + bot.yTargetPos;
    } else {
        // Calculate Trap Target Location
        if(hasOreArray.length > 0 ) {
            const targetPos = findClosestTarget(bot, hasOreArray);
            
            bot.xTargetPos = targetPos.xPos;
            bot.yTargetPos = targetPos.yPos;
        } else if( unexploredArray.length > 0 ) {
            const targetPos = findClosestTarget(bot, unexploredArray);
            
            bot.xTargetPos = targetPos.xPos;
            bot.yTargetPos = targetPos.yPos;
        } else if( unexploredBufferArray.length > 0 ) {
            const targetPos = findClosestTarget(bot, unexploredBufferArray);
            
            bot.xTargetPos = targetPos.xPos;
            bot.yTargetPos = targetPos.yPos;
        } else if( hasRiskyOreArray.length > 0) {
            const targetPos = findClosestTarget(bot, hasRiskyOreArray);
            
            bot.xTargetPos = targetPos.xPos;
            bot.yTargetPos = targetPos.yPos;
        } else {
            return "MOVE 0 " + bot.yPos; // Return home... or maybe try to trigger traps to kill enemy bots?
        }
        
        if( isTargetATrap(bot) || hasNoOre(bot) || (isRiskyOre(bot) && (unexploredBufferArray.length !== 0 || unexploredArray.length !== 0 || hasOreArray.length !== 0))) {
            bot.xTargetPos = -1;
            bot.yTargetPos = -1;
            return calculateTrapLocation(bot);
        } 
        
        if(isBotAtTargetLocation(bot)) {
            return setDig(bot);
        } 
        
        return "MOVE " + bot.xTargetPos + " " + bot.yTargetPos;
    }
    return "WAIT";
}

function calculateRadarLocation( bot: Bot ): string {
    if( bot.xTargetPos !== -1 && bot.yTargetPos !== -1 ) {
        let atTarget = isBotAtTargetLocation( bot );
        if( isTargetATrap(bot) || isRiskyOre(bot)) { 
            bot.xTargetPos = -1;
            bot.yTargetPos = -1;
            return calculateRadarLocation( bot );
        } else if( atTarget ) {
            return setDig(bot);
        }
        return "MOVE " + bot.xTargetPos + " " + bot.yTargetPos;
    } else {
        // Calculate Radar Target Location
        let foundRadarLocation = false;
        if ( hasOreArray.length > 0 ) { // Try to Trace the ore... but if its too far out...
            let currentClosestIndex = 0;
            let currentDistance = 1000;
            let foundValidRadarLocation = false;
            for( let i = 0; i < hasOreArray.length; i++ ) {
                let mapPos = hasOreArray[i];
                let isValidRadarLocation = checkIsValidRadarLocation(mapPos, 3);

                if(isValidRadarLocation) {
                    if(!radarPotentialPlacementArray.includes(mapPos)) {
                        radarPotentialPlacementArray.push(mapPos);
                    }
                    foundValidRadarLocation = true;
                    const tempDistance = distanceBetweenEntities( bot, mapPos );
                    if(tempDistance < currentDistance) {
                        currentDistance = tempDistance;
                        currentClosestIndex =  i;
                    }
                }
            }
            
            if( foundValidRadarLocation ) {
                foundRadarLocation = true;
                let targetPos = hasOreArray.splice(currentClosestIndex, 1)[0];
                bot.xTargetPos = targetPos.xPos;
                bot.yTargetPos = targetPos.yPos;
            }
           
        } 

        if( radarPotentialPlacementArray.length > 0 && !foundRadarLocation ) {
        // if( radarPotentialPlacementArray.length > 0 ) {
            let currentClosestIndex = 0;
            let currentDistance = 1000;
            let foundValidRadarLocation = false;
            let invalidPlacements = new Array();
            for( let i = 0; i < radarPotentialPlacementArray.length; i++ ) {
                let mapPos = radarPotentialPlacementArray[i];
                let isValidRadarLocation = checkIsValidRadarLocation(mapPos, 3);

                if(isValidRadarLocation) {
                    foundValidRadarLocation = true;
                    const tempDistance = distanceBetweenEntities( bot, mapPos );
                    if(tempDistance < currentDistance) {
                        currentDistance = tempDistance;
                        currentClosestIndex =  i;
                    }
                } else {
                    invalidPlacements.push(mapPos);
                }
            }
            
            if( foundValidRadarLocation ) {
                foundRadarLocation = true;
                let targetPos = radarPotentialPlacementArray.splice(currentClosestIndex, 1)[0];
                bot.xTargetPos = targetPos.xPos;
                bot.yTargetPos = targetPos.yPos;
            }
            
            // clear invalid placements
            for(let i = 0; i < invalidPlacements.length; i++ ) {
                removeFromArray(invalidPlacements[i], radarPotentialPlacementArray);
            }
        } 
        
        // Now lets check Unexplore Map Positions... closeish randomly?
        if( unexploredArray.length > 0 && !foundRadarLocation ) {
            let indexCheckedArray = new Array();
            while( !foundRadarLocation && indexCheckedArray.length !== unexploredArray.length) {
                let targetIndex = Math.floor(Math.random() * (unexploredArray.length / 4));
                while( indexCheckedArray.includes(targetIndex)) {
                    if(indexCheckedArray.length > (unexploredArray.length / 2)) {
                        targetIndex = Math.floor(Math.random() * unexploredArray.length);
                    } else if(indexCheckedArray.length > (unexploredArray.length / 4)) {
                        targetIndex = Math.floor(Math.random() * (unexploredArray.length / 2));
                    } else {
                        targetIndex = Math.floor(Math.random() * (unexploredArray.length / 4));
                    }
                }
                
                const mapPos = unexploredArray[targetIndex];
                indexCheckedArray.push(targetIndex);
                foundRadarLocation = checkIsValidRadarLocation(mapPos, 3);
                
                if(foundRadarLocation) {
                    let targetPos = unexploredArray.splice(targetIndex, 1)[0];
                    bot.xTargetPos = targetPos.xPos;
                    bot.yTargetPos = targetPos.yPos;
                }
            }
        } 
        
        // Now lets check Buffer Unexplore Map Positions... closeish randomly?
        if( unexploredBufferArray.length > 0 && !foundRadarLocation ) {
            let indexCheckedArray = new Array();
            while( !foundRadarLocation && indexCheckedArray.length !== unexploredBufferArray.length) {
                let targetIndex = Math.floor(Math.random() * (unexploredBufferArray.length / 4));
                while( indexCheckedArray.includes(targetIndex)) {
                    if(indexCheckedArray.length > (unexploredBufferArray.length / 2)) {
                        targetIndex = Math.floor(Math.random() * unexploredBufferArray.length);
                    } else if(indexCheckedArray.length > (unexploredBufferArray.length / 4)) {
                        targetIndex = Math.floor(Math.random() * (unexploredBufferArray.length / 2));
                    } else {
                        targetIndex = Math.floor(Math.random() * (unexploredBufferArray.length / 4));
                    }
                }
                
                const mapPos = unexploredBufferArray[targetIndex];
                indexCheckedArray.push(targetIndex);
                foundRadarLocation = checkIsValidRadarLocation(mapPos, 3);
                
                if(foundRadarLocation) {
                    let targetPos = unexploredBufferArray.splice(targetIndex, 1)[0];
                    bot.xTargetPos = targetPos.xPos;
                    bot.yTargetPos = targetPos.yPos;
                }
            }
        } 
        

        // Check if there are any valid locations at all... if not then stop pulling radars
        if(!foundRadarLocation) {
            for( let x = 0; x < 30 && !foundRadarLocation; x++ ) {
                for( let y = 0; y < 15 && !foundRadarLocation; y++) {
                    let key: string = "Pos-" + x + "-" + y;
                    let mapPos = map.get(key);
                      
                    foundRadarLocation = checkIsValidRadarLocation(mapPos, 4);
                    
                    if(foundRadarLocation) {
                        bot.xTargetPos = x;
                        bot.yTargetPos = y;
                        
                        inProgressRadarPlacement.push(mapPos);
                    }
                }
            }
        } 
        
        if( !foundRadarLocation ) {
            isValidRadarLocation = false;
            bot.xTargetPos = -1;
            bot.yTargetPos = -1;
            return calculateMoveOrDigEmpty(bot);
        } 
        
        if(isBotAtTargetLocation(bot)) {
            return setDig(bot);
        }         
        
        return "MOVE " + bot.xTargetPos + " " + bot.yTargetPos;
    }
    return "WAIT";
}

function calculateMoveOrDigEmpty( bot: Bot ): string {
    if( bot.xTargetPos !== -1 && bot.yTargetPos !== -1 ) {
        let atTarget = isBotAtTargetLocation( bot );
        if( isTargetATrap(bot) || hasNoOre(bot) || (isRiskyOre(bot) && (unexploredBufferArray.length !== 0 || unexploredArray.length !== 0 || hasOreArray.length !== 0))) { 
            bot.xTargetPos = -1;
            bot.yTargetPos = -1;
            return calculateMoveOrDigEmpty( bot );
        } else if( atTarget ) {
            return setDig(bot);
        }
        return "MOVE " + bot.xTargetPos + " " + bot.yTargetPos;
    } else {
        // Calculate Dig Target Location
        if(hasOreArray.length > 0 ) {
            const targetPos = findClosestTarget(bot, hasOreArray);
            
            bot.xTargetPos = targetPos.xPos;
            bot.yTargetPos = targetPos.yPos;
        } else if( unexploredArray.length > 0 ){
            const targetPos = findClosestTarget(bot, unexploredArray);
            
            bot.xTargetPos = targetPos.xPos;
            bot.yTargetPos = targetPos.yPos;
        } else if( unexploredBufferArray.length > 0 ){
            const targetPos = findClosestTarget(bot, unexploredBufferArray);
            
            bot.xTargetPos = targetPos.xPos;
            bot.yTargetPos = targetPos.yPos;
        } else if( hasRiskyOreArray.length > 0 && myBotsArray[0].id !== bot.id) { // Save 1 bot... always...
            const targetPos = findClosestTarget(bot, hasRiskyOreArray);
            
            bot.xTargetPos = targetPos.xPos;
            bot.yTargetPos = targetPos.yPos;
        } else {
            return "MOVE 0 " + bot.yPos; // Return home... or maybe try to trigger traps to kill enemy bots?
        }
        
        if( isTargetATrap(bot) || hasNoOre(bot) || (isRiskyOre(bot) && (unexploredBufferArray.length !== 0 || unexploredArray.length !== 0 || hasOreArray.length !== 0)) ) {
            bot.xTargetPos = -1;
            bot.yTargetPos = -1;
            return calculateMoveOrDigEmpty(bot);
        } 
        
        if(isBotAtTargetLocation(bot)) {
            return setDig(bot);
        } 
        
        return "MOVE " + bot.xTargetPos + " " + bot.yTargetPos;
    }
    return "WAIT";
}

function updateBot( bot: Bot ): void {
    if(bot.xPos) {
        bot.xLastPos = bot.xPos;
    } 
    if(bot.yPos) {
        bot.yLastPos = bot.yPos;
    }
}

function isBotAtTargetLocation( bot: Bot ): boolean {
    // Check if at location
    if( bot.xPos === bot.xTargetPos && bot.yPos === bot.yTargetPos ) {
        return true;
    // Check if North or South of Location
    } else if( bot.xPos === bot.xTargetPos && (bot.yPos - 1 === bot.yTargetPos || bot.yPos + 1 === bot.yTargetPos)) {
        return true;
    // Check if East or West
    } else if( bot.yPos === bot.yTargetPos && (bot.xPos - 1 === bot.xTargetPos || bot.xPos + 1 === bot.xTargetPos)) {
        return true;
    }
    
    return false;
}

function isTargetATrap(bot: Bot): boolean {
    let posKey: string = "Pos-" + bot.xTargetPos + "-" + bot.yTargetPos;
    let mapPos = map.get(posKey);
    return mapPos.isTrapped;
}

function isRiskyOre(bot: Bot): boolean {
    let key: string = "Pos-" + bot.xTargetPos + "-" + bot.yTargetPos
    let mapPos = map.get(key);
    return hasRiskyOreArray.includes(mapPos);
}

function hasNoOre( bot: Bot): boolean {
    let key: string = "Pos-" + bot.xTargetPos + "-" + bot.yTargetPos
    let mapPos = map.get(key);
    return noOreLeftArray.includes(mapPos);
}

function setDig( bot: Bot): string {
    bot.xDigPos = bot.xTargetPos;
    bot.xTargetPos = -1;
    bot.yDigPos = bot.yTargetPos;
    bot.yTargetPos = -1;
    let action = "DIG " + bot.xDigPos + " " + bot.yDigPos; 
    bot.previousActionDig = true;
    
    let key: string = "Pos-" + bot.xDigPos + "-" + bot.yDigPos;
    let mapPos = map.get(key);
    mapPos.weDugThisHole = true;
    
    return action;
}

// Sort Comparision
function closerToBase(pos1, pos2) {
  return pos1.xPos - pos2.xPos;
}

function distanceBetweenEntities( entity: Entity, entity2: Entity ) {
    return Math.sqrt( (entity.xPos - entity2.xPos) * (entity.xPos - entity2.xPos) + (entity.yPos - entity2.yPos) * (entity.yPos - entity2.yPos));
}

function findClosestTarget( bot: Bot, entityArray: Entity[] ): Entity {
    let currentClosestIndex = 0;
    let currentDistance = 1000;
    for( let i = 0; i < entityArray.length; i++ ) {
        const tempDistance = distanceBetweenEntities( bot, entityArray[i]);
        if(tempDistance < currentDistance) {
            currentDistance = tempDistance;
            currentClosestIndex =  i;
        }
    }
    
    return entityArray.splice(currentClosestIndex, 1)[0];
}

function checkIsValidRadarLocation( mapPos: MapPos, seperationDist: number ) {
    if( !mapPos.isTrapped && (!mapPos.holeExists || (mapPos.holeExists && mapPos.weDugThisHole))) {
        let isWithinAnotherRadarRange: boolean =  false;
        for( let radarIndex = 0; radarIndex < radarLocationArray.length && !isWithinAnotherRadarRange; radarIndex++) {
            let radar = radarLocationArray[radarIndex];
            if( distanceBetweenEntities(mapPos, radar) < seperationDist ) {
                isWithinAnotherRadarRange = true;
            }
        }
        
        for( let radarIndex = 0; radarIndex < inProgressRadarPlacement.length && !isWithinAnotherRadarRange; radarIndex++) {
            let radar = inProgressRadarPlacement[radarIndex];
            if( distanceBetweenEntities(mapPos, radar) < seperationDist ) {
                isWithinAnotherRadarRange = true;
            }
        }
        
        if(!isWithinAnotherRadarRange) {
            return true;
        }
    }    
    return false;
}

function removeFromArray( entity:Entity, entityArrry: Entity[]) {
    const index = entityArrry.indexOf(entity);
    if( index != -1 ) {
        entityArrry.splice(index, 1);
    }
}

function analyzeEnemyBot(bot:Bot) {
    
    let lastPos = new Entity("Null", bot.xLastPos, bot.yLastPos);

    // Movement was left -> returning home after digging...
    if( bot.xLastPos - bot.xPos > 0 && bot.xLastPos !== 0 && bot.stoodStillLastTurn) {
        
        let keyCurrent: string = "Pos-" + bot.xLastPos + "-" + bot.yLastPos; 
        let keyNorth: string = "Pos-" + bot.xLastPos + "-" + (bot.yLastPos -1);
        let keyEast: string = "Pos-" + (bot.xLastPos + 1) + "-" + bot.yLastPos;
        let keySouth: string = "Pos-" + bot.xLastPos + "-" + (bot.yLastPos + 1);
        let keyWest: string = "Pos-" + (bot.xLastPos - 1) + "-" + bot.yLastPos;
        let keyArray: string[] = [keyCurrent, keyNorth, keyEast, keySouth, keyWest];

        // console.error("We think enemy when west... towards home after standingstill: " + keyArray);
        for(let i = 0; i < keyArray.length; i++) {
            if( map.has(keyArray[i])) {
                if(!radarPotentialPlacementArray.includes(map.get(keyArray[i]))) {
                    radarPotentialPlacementArray.push(map.get(keyArray[i]));
                }
            }
        }
    } 
    
    if(bot.stoodStillLastTurn ) {
        bot.stoodStillLastTurn = false;
    }
    
    if( distanceBetweenEntities(lastPos, bot) === 0) {
        bot.stoodStillLastTurn = true;
    }   
    updateBot(bot);
}

/**
 * Deliver more ore to hq (left side of the map) than your opponent. Use radars to find ore but beware of traps!
 **/

var inputs: string[] = readline().split(' ');
const width: number = parseInt(inputs[0]);
const height: number = parseInt(inputs[1]); // size of the map

let radarClaimed: boolean = false;
let trapClaimed: boolean = false;
let isValidRadarLocation: boolean = true;
const xBuffer: number = 3;
const yBuffer: number = 3;

let radarRequester: string = "";
let myBotsArray = new Array();
let enemyBotArray = new Array();
let reCalcBotArray = new Array();
let map = new Map();
let unexploredArray = new Array();
let unexploredBufferArray = new Array();
let notDugByUsArray = new Array();
let noOreLeftArray = new Array();
let hasOreArray = new Array();
let hasRiskyOreArray = new Array();
let radarLocationArray = new Array();
let radarPotentialPlacementArray = new Array();
let inProgressRadarPlacement = new Array();
let myBots = new Map();
let otherBots = new Map();
let traps = new Map();
let radars = new Map();


// game loop
while (true) {
    var inputs: string[] = readline().split(' ');
    const myScore: number = parseInt(inputs[0]); // Amount of ore delivered
    const opponentScore: number = parseInt(inputs[1]);
    for (let i = 0; i < height; i++) {
        var inputs: string[] = readline().split(' ');
        for (let j = 0; j < width; j++) {
            const ore: string = inputs[2*j];// amount of ore or "?" if unknown
            const oreValueKnown = ore !== "?";
            let oreCount = parseInt(ore);
            const holeExists: boolean = parseInt(inputs[2*j+1]) === 1;// 1 if cell has a hole
            let key: string = "Pos-" + j + "-" + i;
            let position: MapPos;
            if( map.has(key)) {
                position = map.get(key);
                position.oreValueKnown = oreValueKnown;
                position.oreCount = oreCount;
                position.holeExists = holeExists;
            } else {
                position = new MapPos( key, oreValueKnown, holeExists, oreCount, j, i);
                map.set(key, position);
                if( j > xBuffer && i >= yBuffer && i <= 14 - yBuffer) {
                    unexploredArray.push(position);
                } else {
                    unexploredBufferArray.push(position);   
                }
            }
            
            if( position.holeExists && !position.weDugThisHole ) {
                if(!notDugByUsArray.includes(position)) {
                    notDugByUsArray.push(position);   
                }
                
                removeFromArray(position, unexploredArray);
                removeFromArray(position, unexploredBufferArray);
                removeFromArray(position, radarPotentialPlacementArray);
            }
            
            if(oreValueKnown) {
                // Remove from Unexplored
                removeFromArray(position, unexploredArray);
                removeFromArray(position, unexploredBufferArray);
                
                // Add to correct other list if it isn't already there.
                if( oreCount !== 0 && !hasOreArray.includes(position) && !notDugByUsArray.includes(position)) {
                    hasOreArray.push(position);
                } else if (oreCount !== 0 && !hasRiskyOreArray.includes(position) && notDugByUsArray.includes(position) ) {
                    hasRiskyOreArray.push(position);   
                    
                    // Remove from hasOreArray
                    removeFromArray(position, hasOreArray);
                    removeFromArray(position, radarPotentialPlacementArray);
                } else if( oreCount === 0 && !noOreLeftArray.includes(position)) {
                    noOreLeftArray.push(position);
                }
            }
            
           
        }
    }
    
    let whichOfOurs = 0;
    var outputs: string[] =  new Array();
    var inputs: string[] = readline().split(' ');
    const entityCount: number = parseInt(inputs[0]); // number of entities visible to you
    const radarCooldown: number = parseInt(inputs[1]); // turns left until a new radar can be requested
    const trapCooldown: number = parseInt(inputs[2]); // turns left until a new trap can be requested
    for (let i = 0; i < entityCount; i++) {
        var inputs: string[] = readline().split(' ');
        const idNum: number = parseInt(inputs[0]); // unique id of the entity
        const id: string = "" + idNum;
        const type: number = parseInt(inputs[1]); // 0 for your robot, 1 for other robot, 2 for radar, 3 for trap
        const x: number = parseInt(inputs[2]);
        const y: number = parseInt(inputs[3]); // position of the entity
        const item: number = parseInt(inputs[4]); // if this entity is a robot, the item it is carrying (-1 for NONE, 2 for RADAR, 3 for TRAP, 4 for ORE)
        
        
        let posKey: string = "Pos-" + x + "-" + y;
        switch(type) {
            case 0: {
                let myBot;
                if(myBots.has(id)) {
                    myBot = myBots.get(id);
                    myBot.update(x, y, item);
                } else {
                    myBot = new Bot(id, x, y, item);
                    myBots.set(id, myBot);
                }
                myBotsArray.push(myBot);
                break;
            }
            
            case 1: {
                let theirBot;
                if(otherBots.has(id)) {
                     theirBot = otherBots.get(id);
                    theirBot.update(x, y, item);
                } else {
                    theirBot = new Bot(id, x, y, item);
                    otherBots.set(id, theirBot );
                }
                enemyBotArray.push(theirBot);
                break;
            }
            
            case 2: {
                if(radars.has(id)) {
                    let radar = radars.get(id);
                    radar.updatePos(x, y);
                } else {
                    const radar = new Entity(id, x, y);
                    radars.set(id, radar);
                    radarLocationArray.push(radar);
                    
                    let mapPos = map.get(posKey);
                    
                    removeFromArray(mapPos, inProgressRadarPlacement);
                    removeFromArray(mapPos, radarPotentialPlacementArray);
                }
                break;
            }
            
            case 3: {
                if(traps.has(id)) {
                    let trap = traps.get(id);
                    trap.updatePos(x, y);
                } else {
                    traps.set(id, new Entity(id, x, y));
                    let mapPos = map.get(posKey);
                    mapPos.isTrapped = true;
                }
                break;
            }
            
            default: {
                console.error("Something funny is happening...");
                break;
            }
        }
            
    }
    
    // console.error("Map Size: " + map.size);
    // console.error("MyBot Count: " + myBots.size);
    // console.error("MyBotArray Count: " + myBotsArray.length);
    // console.error("OtherBots Count: " + otherBots.size);
    console.error("Unexplored Count: " + unexploredArray.length);
    console.error("UnExplored Buffer Count: " + unexploredBufferArray.length);
    console.error("Holes Not Dug by Us: " + notDugByUsArray.length);
    console.error("Has No Ore Count: " + noOreLeftArray.length);
    console.error("Has Ore Count: " + hasOreArray.length);
    console.error("Risky Ore Count: " + hasRiskyOreArray.length);
    console.error("Radar Locations: " + radarLocationArray.length);
    console.error("Potential Radar Locations: " + radarPotentialPlacementArray.length);
    console.error("Radars Count: " + radars.size);
    console.error("Traps Count: " + traps.size);
    
    //  Do all calculations here... we have all the info now.\
    
    for(let i = 0; i < enemyBotArray.length; i++) {
        let enemyBot = enemyBotArray[i];
        if( enemyBot ) {
            analyzeEnemyBot(enemyBot);
        }
    }

    hasOreArray.sort(closerToBase);
    unexploredArray.sort(closerToBase);
    unexploredBufferArray.sort(closerToBase);
    radarLocationArray.sort(closerToBase);
    radarPotentialPlacementArray.sort(closerToBase);
    
    for(let i = 0; i < 5; i++) { // Bad... but its working...??...
        let currentBot = myBotsArray[i];
        
        calculateAction(currentBot, radarCooldown, trapCooldown); 
    }
    
    while( reCalcBotArray.length > 0 ) {
        let currentBot = reCalcBotArray.pop();
        calculateAction(currentBot, radarCooldown, trapCooldown); 
    }
    
    for (let i = 0; i < 5; i++) {

        // Write an action using console.log()
        // To debug: console.error('Debug messages...');

        //console.log('WAIT');         // WAIT|MOVE x y|DIG x y|REQUEST item
        let currentBot = myBotsArray[i];;
        if( currentBot.action ) {
            console.log(currentBot.action);
        } else {
            console.log("WAIT");
        }

    }
    trapClaimed = false;
    radarClaimed = false;
    myBotsArray = new Array();
    enemyBotArray = new Array();
}