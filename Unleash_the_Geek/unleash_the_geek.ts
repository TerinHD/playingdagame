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
            }
            
            const unexploredIndex = unexploredArray.indexOf(mapPosition);
            if( unexploredIndex != -1 ) {
                unexploredArray.splice(unexploredIndex, 1);
            }
            
        } else if( this.previousActionDig && this.item === -1) {
            let key: string = "Pos-" + this.xDigPos + "-" + this.yDigPos;
            let mapPosition = map.get(key);
            mapPosition.noOreLeft = true;
            if(!noOreLeftArray.includes(mapPosition)) {
                noOreLeftArray.push(mapPosition);
            }
            
            const hasOreIndex = hasOreArray.indexOf(mapPosition);
            if( hasOreIndex != -1 ) {
                hasOreArray.splice(hasOreIndex, 1);
            }
            
            const unexploredIndex = unexploredArray.indexOf(mapPosition);
            if( unexploredIndex != -1 ) {
                unexploredArray.splice(unexploredIndex, 1);
            }
        } 
        
        if( this.previousActionDig ) {
            let key: string = "Pos-" + this.xDigPos + "-" + this.yDigPos;
            let mapPosition = map.get(key);
            this.xDigPos = -1;
            this.yDigPos = -1;  
            
            const targetIndex = targetArray.indexOf(mapPosition);
            if( targetIndex !== -1 ) {
                console.error("Removing Target: " + key);
                targetArray.splice(targetIndex, 1);
            }
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
    holeExists: boolean;
    positionClaimed:  boolean;
    noOreLeft: boolean = false; // False = unknown, true = dug no ore found
    previousDigFoundOre: boolean = false; // False means unknown, true means previous dig found ore here
    
    constructor(id:string, oreValueKnown: boolean, holeExists: boolean, oreCount: number, xPos: number, yPos: number) {
        super(id, xPos, yPos);
        this.oreCount = oreCount;
        this.oreValueKnown = oreValueKnown;
        this.holeExists = holeExists;
    }
};


function calculateAction( bot: Bot,  radarCooldown: number, trapCooldown: number): void {
    let action = "WAIT";
    if( bot.xPos === 0 && radarCooldown === 0 && bot.item === -1 && !radarClaimed ) {
        if(radarRequester !== "" ) {
            reCalcBotArray.push(myBots.get(radarRequester));
        }
        radarRequester = bot.id;
        bot.previousActionRequestRadar = true;
        radarClaimed = true;
        bot.action = "REQUEST RADAR";
    } else if( bot.xPos === 0 && trapCooldown === 0 && bot.item === -1 && !trapClaimed ) {
        trapClaimed = true;
        bot.action = "REQUEST TRAP";
    } else if( bot.item === 4 ) {
        bot.action = "MOVE 0 " + bot.yPos;
    } else if( radarCooldown === 0 && bot.item === -1 && (radarRequester === bot.id || radarRequester === "")) {
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

// function calculateTrapLocation( bot: Bot ): string {
//     if( bot.xTargetPos !== -1 && bot.yTargetPos !== -1 ) {
//         let atTarget = isBotAtTargetLocation( bot );
//         if( atTarget && isTargetATrap(bot)) { 
//             bot.xTargetPos = -1;
//             bot.yTargetPos = -1;
//             return calculateTrapLocation( bot );
//         } else if( atTarget ) {
//             return setDig(bot);
//         }
//         return "MOVE " + bot.xTargetPos + " " + bot.yTargetPos;
//     } else {
//         // Calculate Trap Target Location
//         bot.xTargetPos = Math.floor(Math.random() * 28) + 2;
//         bot.yTargetPos = Math.floor(Math.random() * 15);
//         if( isTargetATrap(bot) ) {
//             bot.xTargetPos = -1;
//             bot.yTargetPos = -1;
//             return calculateTrapLocation(bot);
//         } 
//         return "MOVE " + bot.xTargetPos + " " + bot.yTargetPos;
//     }
//     return "WAIT";
// }

function calculateTrapLocation( bot: Bot ): string {
    if( bot.xTargetPos !== -1 && bot.yTargetPos !== -1 ) {
        let atTarget = isBotAtTargetLocation( bot );
        if( atTarget && isTargetATrap(bot)) { 
            bot.xTargetPos = -1;
            bot.yTargetPos = -1;
            return calculateTrapLocation( bot );
        } else if( atTarget ) {
            return setDig(bot);
        }
        return "MOVE " + bot.xTargetPos + " " + bot.yTargetPos;
    } else {
        // Calculate Radar Target Location
        console.error("Radar HasOreArrayLength: " + hasOreArray.length);
        if(hasOreArray.length > 0 ) {
            //const targetIndex = Math.floor(Math.random() * hasOreArray.length);
            // const targetPos = hasOreArray.splice(targetIndex, 1)[0];
            const targetPos = hasOreArray.shift();
            
            bot.xTargetPos = targetPos.xPos;
            bot.yTargetPos = targetPos.yPos;
            targetArray.push(targetPos);
        } else {
            // const targetIndex = Math.floor(Math.random() * unexploredArray.length);
            // const targetPos = unexploredArray.splice(targetIndex, 1)[0];
            const targetPos = unexploredArray.shift();
            
            bot.xTargetPos = targetPos.xPos;
            bot.yTargetPos = targetPos.yPos;
            targetArray.push(targetPos);
        }
        
        if( isTargetATrap(bot) || hasNoOre(bot) ) {
            bot.xTargetPos = -1;
            bot.yTargetPos = -1;
            return calculateTrapLocation(bot);
        } 
        return "MOVE " + bot.xTargetPos + " " + bot.yTargetPos;
    }
    return "WAIT";
}

function calculateRadarLocation( bot: Bot ): string {
    if( bot.xTargetPos !== -1 && bot.yTargetPos !== -1 ) {
        let atTarget = isBotAtTargetLocation( bot );
        if( atTarget && isTargetATrap(bot)) { 
            bot.xTargetPos = -1;
            bot.yTargetPos = -1;
            return calculateRadarLocation( bot );
        } else if( atTarget ) {
            return setDig(bot);
        }
        return "MOVE " + bot.xTargetPos + " " + bot.yTargetPos;
    } else {
        // Calculate Radar Target Location
        console.error("Radar HasOreArrayLength: " + hasOreArray.length);
        if(hasOreArray.length > 0 ) {
            //const targetIndex = Math.floor(Math.random() * hasOreArray.length);
            // const targetPos = hasOreArray.splice(targetIndex, 1)[0];
            const targetPos = hasOreArray.shift();
            
            bot.xTargetPos = targetPos.xPos;
            bot.yTargetPos = targetPos.yPos;
            targetArray.push(targetPos);
        } else {
             const targetIndex = Math.floor(Math.random() * (unexploredArray.length / 4));
             const targetPos = unexploredArray.splice(targetIndex, 1)[0];
            // const targetPos = unexploredArray.shift();
            
            bot.xTargetPos = targetPos.xPos;
            bot.yTargetPos = targetPos.yPos;
            targetArray.push(targetPos);
        }
        
        if( isTargetATrap(bot) || hasNoOre(bot) ) {
            bot.xTargetPos = -1;
            bot.yTargetPos = -1;
            return calculateRadarLocation(bot);
        } 
        return "MOVE " + bot.xTargetPos + " " + bot.yTargetPos;
    }
    return "WAIT";
}

function calculateMoveOrDigEmpty( bot: Bot ): string {
    if( bot.xTargetPos !== -1 && bot.yTargetPos !== -1 ) {
        let atTarget = isBotAtTargetLocation( bot );
        if( atTarget && isTargetATrap(bot)) { 
            bot.xTargetPos = -1;
            bot.yTargetPos = -1;
            return calculateMoveOrDigEmpty( bot );
        } else if( atTarget ) {
            return setDig(bot);
        }
        return "MOVE " + bot.xTargetPos + " " + bot.yTargetPos;
    } else {
        // Calculate Dig Target Location
        console.error("Dig/Move HasOreArrayLength: " + hasOreArray.length);
        if(hasOreArray.length > 0 ) {
            // const targetIndex = Math.floor(Math.random() * hasOreArray.length);
            // const targetPos = hasOreArray.splice(targetIndex, 1)[0];
            const targetPos = hasOreArray.shift();
            
            bot.xTargetPos = targetPos.xPos;
            bot.yTargetPos = targetPos.yPos;
            targetArray.push(targetPos);
        } else {
            // const targetIndex = Math.floor(Math.random() * unexploredArray.length);
            // const targetPos = unexploredArray.splice(targetIndex, 1)[0];
            const targetPos = unexploredArray.shift();
            
            bot.xTargetPos = targetPos.xPos;
            bot.yTargetPos = targetPos.yPos;
            targetArray.push(targetPos);
        }
        
        if( isTargetATrap(bot) ) {
            bot.xTargetPos = -1;
            bot.yTargetPos = -1;
            return calculateMoveOrDigEmpty(bot);
        } 
        return "MOVE " + bot.xTargetPos + " " + bot.yTargetPos;
    }
    return "WAIT";
}

function updateBot( bot: Bot ): void {
    bot.xLastPos = bot.xPos;
    bot.yLastPos = bot.yPos;
}

function isBotAtTargetLocation( bot: Bot ): boolean {
    if( bot.xPos === bot.xTargetPos || (bot.xPos - 1) === bot.xTargetPos || (bot.xPos + 1) === bot.xTargetPos) {
        if( bot.yPos === bot.yTargetPos || (bot.yPos - 1) === bot.yTargetPos || (bot.yPos + 1) === bot.yTargetPos) {
            return true;
        }
    }
    return false;
}

function isTargetATrap(bot: Bot): boolean {
    let isTargetATrap = false;
    traps.forEach((value: Entity, key: string) => {
        if( value.xPos === bot.xTargetPos && value.yPos === bot.yTargetPos) {
            isTargetATrap = true;
        }
    });
    return isTargetATrap;
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
    
    return action;
}

// Sort Comparision
function closerToBase(pos1, pos2) {
  return pos1.xPos - pos2.xPos;
}


/**
 * Deliver more ore to hq (left side of the map) than your opponent. Use radars to find ore but beware of traps!
 **/

var inputs: string[] = readline().split(' ');
const width: number = parseInt(inputs[0]);
const height: number = parseInt(inputs[1]); // size of the map

let radarClaimed: boolean = false;
let trapClaimed: boolean = false;

let radarRequester: string = "";
let myBotsArray = new Array();
let reCalcBotArray = new Array();
let map = new Map();
let targetArray = new Array();
let unexploredArray = new Array();
let noOreLeftArray = new Array();
let hasOreArray = new Array();
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
                if( j > 5 ) {
                    unexploredArray.push(position);
                }
            }
            
            if(oreValueKnown) {
                // Remove from Unexplored
                const unexploredIndex = unexploredArray.indexOf(position);
                if( unexploredIndex != -1 ) {
                    unexploredArray.splice(unexploredIndex, 1);
                }
                
                // Add to correct other list if it isn't already there.
                if( oreCount !== 0 && !hasOreArray.includes(position)) {
                    hasOreArray.push(position);
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
                if(otherBots.has(id)) {
                    let theirBot = otherBots.get(id);
                    theirBot.update(x, y, item);
                } else {
                    otherBots.set(id, new Bot(id, x, y, item));
                }
                break;
            }
            
            case 2: {
                if(radars.has(id)) {
                    let radar = radars.get(id);
                    radar.updatePos(x, y);
                } else {
                    radars.set(id, new Entity(id, x, y));
                }
                break;
            }
            
            case 3: {
                if(traps.has(id)) {
                    let trap = traps.get(id);
                    trap.updatePos(x, y);
                } else {
                    traps.set(id, new Entity(id, x, y));
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
    console.error("Has No Ore Count: " + noOreLeftArray.length);
    console.error("Has Ore Count: " + hasOreArray.length);
    console.error("Target Count: " + targetArray.length);
    console.error("Radars Count: " + radars.size);
    console.error("Traps Count: " + traps.size);
    
    //  Do all calculations here... we have all the info now.\
    
    hasOreArray.sort(closerToBase);
    unexploredArray.sort(closerToBase);
    
    for(let i = 0; i < 5; i++) {
        let currentBot = myBotsArray[i];
        
        calculateAction(currentBot, radarCooldown, trapCooldown); 
    }
    
    while( reCalcBotArray.length > 0 ) {
        console.error("In While Loop");
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
}