/*
 * The BIG LIST OF IMPROVEMENTS:  
 * 
 * * TraceId... to trace back to origin point.  Helpful in predicting future moves
 * * If firing torpedo, check if damage occurs... can help narrow down location
 * * Improve firing solutions
 * * Improve movement so don't trap myself
 * * Start location... needs to be in the largest continuous water... islands can create smaller closed off water locations... :(
 * * Update Tracking to take into account Sonar
 * * Update Tracking to take into account silence <-- Priority
 * * Track enemy cooldowns... would be imperfect...
 * 
 * 
 */

// Structures for the Game

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

class MapPos extends Entity {
    isLand: boolean;
    hasMine: boolean;
    weHaveBeen: boolean;
    
    sector: number = 0; 
    maxNorth: number = 0;
    maxEast: number = 0;
    maxSouth: number = 0;
    maxWest:  number = 0;
    constructor(id:string, xPos: number, yPos: number, isLand:boolean = false, hasMine:boolean = false, weHaveBeen:boolean = false ) {
        super(id, xPos, yPos);
        this.isLand = isLand;
        this.hasMine = hasMine;
        this.weHaveBeen = weHaveBeen;
    }
    
    public toString(): string {
        return "id: " + this.id 
            + "; x: " + this.xPos 
            + "; y: " + this.yPos 
            + "; isLand: " + this.isLand 
            + "; hasMine: " + this.hasMine
            + "; weHaveBeen: " + this.weHaveBeen
            + "; sector: " + this.sector
            + "; maxNorth: " + this.maxNorth
            + "; maxEast: " + this.maxEast
            + "; maxSouth: " + this.maxSouth
            + "; maxWest: " + this.maxWest;   
    }
};

class MapMove {
    mapPos: MapPos;
    directionLabel: string;
    distanceMoved: number = 1;
    posMovedThrough: MapPos[];

    constructor( mapPos: MapPos, directionLabel: string, distanceMoved?:number, posMovedThrough?:MapPos[]) {
        this.mapPos = mapPos;
        this.directionLabel = directionLabel;
        if(distanceMoved) {
            this.distanceMoved = distanceMoved;
        }
        if(posMovedThrough) {
            this.posMovedThrough = posMovedThrough;
        }
    }
}


// Variables to use

let map: Map<string, MapPos> = new Map();
let potentialEnemyPositions: MapPos[] = new Array();
let myCurrentPos: MapPos;

let currentLife: number = 6;
let currentOppenentLife: number = 6;
let currentTorpedoCooldown: number = 0;
let currentSonarCooldown: number = 0;
let currentSilenceCooldown: number = 0;
let currentMineCooldown: number = 0;
let currentSonarResult: string = "";

const TORPEDO_RANGE: number = 4;
const NORTH: number = -1;
const EAST: number = 1;
const SOUTH: number = 1;
const WEST: number = -1;

const NORTH_LABEL: string = "N";
const EAST_LABEL: string = "E";
const SOUTH_LABEL: string = "S";
const WEST_LABEL: string = "W";

// Utility Methods


function distanceBetweenEntities( entity: Entity, entity2: Entity ) {
    return Math.sqrt( (entity.xPos - entity2.xPos) * (entity.xPos - entity2.xPos) + (entity.yPos - entity2.yPos) * (entity.yPos - entity2.yPos));
}

function removeFromArray( entity:Entity, entityArrry: Entity[]) {
    const index = entityArrry.indexOf(entity);
    if( index != -1 ) {
        entityArrry.splice(index, 1);
    }
}


// Method Calculations

function createMapId(xPos:number, yPos:number) : string {
    return xPos + "-" + yPos;
}

function clearHasBeenThere() {
    for (let i = 0; i < height; i++) {
        for( let j = 0; j < width; j++) {
            map.get(createMapId(j, i)).weHaveBeen = false;
        }
    }
}

function calculateAllMaxDirections() {
    for (let i = 0; i < height; i++) {
        for( let j = 0; j < width; j++) {
            const mapPos = map.get(createMapId(j, i));
            calculateMaxDirections( mapPos );
            // if( i == 9 || i == 10 ) {
            //     console.error("MapPos: " + mapPos.toString());
            // }
        }
    }
}

function calculateMaxDirections( mapPos: MapPos ) {
    if( !mapPos.isLand) {
        mapPos.maxNorth = calculateMaxDirection( mapPos, NORTH, false);
        mapPos.maxEast = calculateMaxDirection( mapPos, EAST, true);
        mapPos.maxSouth = calculateMaxDirection( mapPos, SOUTH, false);
        mapPos.maxWest = calculateMaxDirection( mapPos, WEST, true);
    }
}

function calculateMaxDirection( mapPos: MapPos, direction: number, xAxis: boolean ): number {
    let countDistance = 0;
    let notHitLand = true;
    if( xAxis ) {
        let newXPos = mapPos.xPos + direction;
        while( newXPos >= 0 && newXPos < width && notHitLand) {
            if( map.get(createMapId(newXPos, mapPos.yPos)).isLand) {
                notHitLand = false;   
            } else {
                countDistance++;
                newXPos = newXPos + direction;        
            }
        }
    } else {
        let newYPos = mapPos.yPos + direction;
        while( newYPos >= 0 && newYPos < height && notHitLand) {
            if( map.get(createMapId(mapPos.xPos, newYPos)).isLand) {
                notHitLand = false;   
            } else {
                countDistance++;
                newYPos = newYPos + direction;        
            }
        }
    }
    
    return countDistance;
}

function calculateSectorValue(mapPos: MapPos) {
    if( mapPos.yPos < 5 ) {
        if( mapPos.xPos < 5 ) {
            mapPos.sector = 1;
        } else if ( mapPos.xPos >=5 && mapPos.xPos < 10 ) {
            mapPos.sector = 2;
        } else {
            mapPos.sector = 3;
        }
    } else if ( mapPos.yPos >=5 && mapPos.yPos < 10 ) {
        if( mapPos.xPos < 5 ) {
            mapPos.sector = 4;
        } else if ( mapPos.xPos >=5 && mapPos.xPos < 10 ) {
            mapPos.sector = 5;
        } else {
            mapPos.sector = 6;
        }
    } else {
        if( mapPos.xPos < 5 ) {
            mapPos.sector = 7;
        } else if ( mapPos.xPos >=5 && mapPos.xPos < 10 ) {
            mapPos.sector = 8;
        } else {
            mapPos.sector = 9;
        }
    }
            
}

function calculateEnemyPosSurface( enemyOrder: string) {
    let tempEnemyOrder = enemyOrder;
    const enemySector:number = Number(tempEnemyOrder.replace('SURFACE ', ''));
    let newPotentialEnemyPositions:MapPos[] = new Array();
    for( let potentialPos of potentialEnemyPositions) {
        if( potentialPos.sector === enemySector) {
            newPotentialEnemyPositions.push(potentialPos);
        }
    }
    potentialEnemyPositions = newPotentialEnemyPositions;
}

function calculateEnemyPosTorpedo( enemyOrder:string ) {
    let tempEnemyOrder = enemyOrder;
    const position = tempEnemyOrder.replace('TORPEDO ', '').split(' ');
    if( position.length === 2 ) {
        const xPos:number = Number(position[0]);
        const yPos:number = Number(position[1]);
        let newPotentialEnemyPositions:MapPos[] = new Array();
        for( let potentialPos of potentialEnemyPositions) {
            // console.error(" Checking distance between:  "  + xPos + "," + yPos + " and " + potentialPos.xPos + "," + potentialPos.yPos);
            if( distanceBetweenEntities(potentialPos, map.get(createMapId(xPos, yPos))) <= TORPEDO_RANGE) {
                newPotentialEnemyPositions.push(potentialPos);
            }
        }
        potentialEnemyPositions = newPotentialEnemyPositions;
    } else {
        console.error("SOMETHING WENT HORRIBLY WRONG PARSING AN ENEMY TORPEDO ACTION: " + enemyOrder);
    }
}

function calculateEnemyPosMove( enemyOrder:string) {
    let tempEnemyOrder = enemyOrder;
    const directionLabel = tempEnemyOrder.replace('MOVE ', '');

    let newPotentialEnemyPositions:MapPos[] = new Array();
    for( let potentialPos of potentialEnemyPositions) {
        let newPotentialPos: MapPos;
        switch(directionLabel) {
            case NORTH_LABEL:
                if( potentialPos.maxNorth > 0 ) {
                    newPotentialPos = map.get(createMapId(potentialPos.xPos, potentialPos.yPos + NORTH ));
                }
                break;
            case SOUTH_LABEL:
                if( potentialPos.maxSouth > 0 ) {
                    newPotentialPos = map.get(createMapId(potentialPos.xPos, potentialPos.yPos + SOUTH ));
                }
                break;
            case EAST_LABEL:
                if( potentialPos.maxEast > 0 ) {
                    newPotentialPos = map.get(createMapId(potentialPos.xPos + EAST, potentialPos.yPos));
                }
                break;
            case WEST_LABEL:
                if( potentialPos.maxWest > 0 ) {
                    newPotentialPos = map.get(createMapId(potentialPos.xPos + WEST, potentialPos.yPos));
                }
                break;
        }

        if( newPotentialPos && !newPotentialPos.isLand ) {
            newPotentialEnemyPositions.push(newPotentialPos);
        }
    }
    potentialEnemyPositions = newPotentialEnemyPositions;
}

function calcultateEnemyPosSilence( enemyOrder: string) {
    
}

function calculateEnemyPos( enemyOrders: string[] ) {

    for( let enemyOrder of enemyOrders ) {
        console.error("enemyOrder: " + enemyOrder);
        if(enemyOrder.includes('SURFACE') ) {
            calculateEnemyPosSurface(enemyOrder);
        } else if (enemyOrder.includes('TORPEDO')) {
            calculateEnemyPosTorpedo(enemyOrder);
        } else if (enemyOrder.includes('MOVE')) {
            calculateEnemyPosMove(enemyOrder);
        } else if (enemyOrder.includes("SILENCE")) {
            calcultateEnemyPosSilence(enemyOrder);
        }
        console.error("Potential Enemy Pos#s: " + potentialEnemyPositions.length);
        if(potentialEnemyPositions.length === 1) {
            const enemyPos: MapPos = potentialEnemyPositions[0];
            console.error("GOT YOU AT: " + enemyPos.xPos + "," + enemyPos.yPos);
            console.error("MapPos: " + enemyPos.toString());
        } else if ( potentialEnemyPositions.length < 6 ) {
            for( let enemyPos of potentialEnemyPositions) {
                console.error("Potential Enemy Position: " + enemyPos.toString());
            }
        }
    }
}

function isPositionLegal( position: MapPos): boolean {
    console.error("POSITION LEGAL? " + position.toString());
    return isPositionSafe(position) && !position.weHaveBeen;
}

function isPositionSafe( position: MapPos): boolean {
    console.error("POSITION SAFE? " + position.toString());
    return !position.isLand;
}

function findRandomMove( positionChecker: Function, possiblePositions:MapMove[] ): MapMove {
    let nextPos: MapMove = null;
    let foundGoodPos: boolean = false;

    while(possiblePositions.length > 0 && !foundGoodPos ) {
        const randomPos: number = Math.floor(Math.random() * possiblePositions.length);
        const mapMove: MapMove = possiblePositions.splice(randomPos, 1)[0];
        // const mapMove: MapMove = newPostions.splice(0, 1)[0];

        if(mapMove.mapPos && positionChecker(mapMove.mapPos)) {
            nextPos = mapMove;
            foundGoodPos = true;
        }
    }

    return nextPos;
}

function findMove( positionChecker: Function ):MapMove {

    const northPos: MapMove = new MapMove(map.get(createMapId(myCurrentPos.xPos, myCurrentPos.yPos + NORTH)), 'N');
    const eastPos: MapMove = new MapMove(map.get(createMapId(myCurrentPos.xPos + EAST, myCurrentPos.yPos)), 'E');
    const southPos: MapMove = new MapMove(map.get(createMapId(myCurrentPos.xPos, myCurrentPos.yPos + SOUTH)), 'S');
    const westPos: MapMove = new MapMove(map.get(createMapId(myCurrentPos.xPos + WEST, myCurrentPos.yPos)), 'W');

    let newPostions: MapMove[] = [northPos, eastPos, southPos, westPos];

    return findRandomMove(positionChecker, newPostions);
}

function findMoveTowardsTarget( positionChecker: Function ):MapMove {

    let nextPos: MapMove = null;
    const currentEnemyPos: MapPos = potentialEnemyPositions[0];

    const northPos: MapMove = new MapMove(map.get(createMapId(myCurrentPos.xPos, myCurrentPos.yPos + NORTH)), 'N');
    const eastPos: MapMove = new MapMove(map.get(createMapId(myCurrentPos.xPos + EAST, myCurrentPos.yPos)), 'E');
    const southPos: MapMove = new MapMove(map.get(createMapId(myCurrentPos.xPos, myCurrentPos.yPos + SOUTH)), 'S');
    const westPos: MapMove = new MapMove(map.get(createMapId(myCurrentPos.xPos + WEST, myCurrentPos.yPos)), 'W');

    let xPosDiff:number = myCurrentPos.xPos - currentEnemyPos.xPos; // If Negative then E, If Positive then W, 0 then same xPos
    let yPosDiff:number = myCurrentPos.yPos - currentEnemyPos.yPos; // If Negative then S, If Positive then N, 0 then same yPos

    if( xPosDiff === 0 && yPosDiff === 0) {
        nextPos = findMove(positionChecker);
    } else if( xPosDiff === 0 && yPosDiff > 0 ) { // Due North of us
        if(northPos.mapPos && positionChecker(northPos.mapPos) ) {
            nextPos = northPos;
        } else {
            let newPostions: MapMove[] = [eastPos, westPos];
            nextPos = findRandomMove(positionChecker, newPostions);
        }        
    } else if( xPosDiff === 0 && yPosDiff < 0) { // Due South of us
        if(southPos.mapPos && positionChecker(southPos.mapPos)) {
            nextPos = southPos;
        } else {
            let newPostions: MapMove[] = [eastPos, westPos];
            nextPos = findRandomMove(positionChecker, newPostions);
        } 
    } else if( xPosDiff > 0 ) { // West of us
        if( yPosDiff === 0 ) { // Due West of us
            if(westPos.mapPos && positionChecker(westPos.mapPos)) {
                nextPos = westPos;
            } else {
                let newPostions: MapMove[] = [northPos, southPos];
                nextPos = findRandomMove(positionChecker, newPostions);
            } 
        } else if ( yPosDiff > 0 ) { // Northwest of us... 
            if(northPos.mapPos && positionChecker(northPos.mapPos) ) {
                nextPos = northPos;
            } else if ( westPos.mapPos && positionChecker(westPos.mapPos) ){
                nextPos = westPos;
            } else {
                let newPostions: MapMove[] = [southPos, eastPos];
                nextPos = findRandomMove(positionChecker, newPostions);
            }
        } else if ( yPosDiff < 0 ) { // Southwest of us...
            if(southPos.mapPos && positionChecker(southPos.mapPos) ) {
                nextPos = southPos;
            } else if ( westPos.mapPos && positionChecker(westPos.mapPos) ){
                nextPos = westPos;
            } else {
                let newPostions: MapMove[] = [northPos, eastPos];
                nextPos = findRandomMove(positionChecker, newPostions);
            }
        }

    } else if( xPosDiff < 0 ) { // East of us
        if( yPosDiff === 0 ) { // Due East of us
            if(eastPos.mapPos && positionChecker(eastPos.mapPos)) {
                nextPos = eastPos;
            } else {
                let newPostions: MapMove[] = [northPos, southPos];
                nextPos = findRandomMove(positionChecker, newPostions);
            } 
        } else if ( yPosDiff > 0 ) { // Northeast of us... 
            if(northPos.mapPos && positionChecker(northPos.mapPos) ) {
                nextPos = northPos;
            } else if ( eastPos.mapPos && positionChecker(eastPos.mapPos) ){
                nextPos = eastPos;
            } else {
                let newPostions: MapMove[] = [southPos, westPos];
                nextPos = findRandomMove(positionChecker, newPostions);
            }
        } else if ( yPosDiff < 0 ) { // Southeast of us...
            if(southPos.mapPos && positionChecker(southPos.mapPos) ) {
                nextPos = southPos;
            } else if ( eastPos.mapPos && positionChecker(eastPos.mapPos) ){
                nextPos = eastPos;
            } else {
                let newPostions: MapMove[] = [northPos, westPos];
                nextPos = findRandomMove(positionChecker, newPostions);
            }
        }
    }

    return nextPos;
}

function findSilenceDirectionalPosibitilies( positionChecker: Function, directionLabel: string, direction: number, xAxis:boolean, possiblePositions:MapMove[]) {
    let directionCount: number = 1;
    let unsafeFound: boolean = false;
    let lastPosFound: MapPos = myCurrentPos;
    let positionsMovedThrough: MapPos[] = new Array();

    while( directionCount <= 4 && !unsafeFound) {
        let nextPosToCheck: MapPos = null;
        if(xAxis) { // East & West Movement
            nextPosToCheck = map.get(createMapId(lastPosFound.xPos + direction, lastPosFound.yPos));
        } else { // North & South Movement
            nextPosToCheck = map.get(createMapId(lastPosFound.xPos, lastPosFound.yPos + direction));
        }

        if( nextPosToCheck && positionChecker(nextPosToCheck)) {
            positionsMovedThrough.push(lastPosFound);
            possiblePositions.push( new MapMove(nextPosToCheck, directionLabel, directionCount, positionsMovedThrough));
            lastPosFound = nextPosToCheck;
            directionCount++;
        } else {
            unsafeFound = true;
        }
    }
}

function findSilenceMove( positionChecker: Function): MapMove {

    let possiblePositions: MapMove[] = new Array();

    findSilenceDirectionalPosibitilies(positionChecker, 'N', NORTH, false, possiblePositions );
    findSilenceDirectionalPosibitilies(positionChecker, 'S', SOUTH, false, possiblePositions );
    findSilenceDirectionalPosibitilies(positionChecker, 'E', EAST, true, possiblePositions );
    findSilenceDirectionalPosibitilies(positionChecker, 'W', WEST, true, possiblePositions );

    return findRandomMove(positionChecker, possiblePositions);
}

function calculateNextMove(): string {
    
    let command: string = '';
    let mapMove: MapMove;
    let useSilence: boolean = false;

    if( potentialEnemyPositions.length === 1 ) {
        mapMove = findMoveTowardsTarget(isPositionLegal);
    } else if (currentSilenceCooldown === 0 ) {
        useSilence = true;
        mapMove = findSilenceMove(isPositionLegal);
    } else {
        mapMove = findMove(isPositionLegal);
    }
     
    if( !mapMove ) {
        if( potentialEnemyPositions.length === 1 ) {
            mapMove = findMoveTowardsTarget(isPositionSafe);
        } else {
            mapMove = findMove(isPositionSafe);
        }   

        if( mapMove ) {
            command = 'SURFACE | MOVE ' + mapMove.directionLabel;
        } else {
            console.error("WELL... we picked a bad start location... a single water cell...");
            command = "SURFACE";
        }
    } else {

        let power:String = 'TORPEDO';

        if( currentSilenceCooldown > 0 ) {
            power = 'SILENCE';
        }

        if( currentSonarCooldown > 0 ) {
            power = 'SONAR';
        }

        if( currentTorpedoCooldown > 0 ) {
            power = 'TORPEDO';
        }

        // if( currentMineCooldown > 0 ) {
        //     power = 'MINE';
        // }

        if(useSilence) {
            command = 'SILENCE ' + mapMove.directionLabel + ' ' + mapMove.distanceMoved;
            for( let mapPos of mapMove.posMovedThrough) {
                mapPos.weHaveBeen = true;
            }
        } else {
            command = 'MOVE ' + mapMove.directionLabel + ' ' + power;
        }
    }

    if( currentTorpedoCooldown === 0 && potentialEnemyPositions.length === 1) {
        const currentEnemyPos: MapPos = potentialEnemyPositions[0];
        if( distanceBetweenEntities(mapMove.mapPos, currentEnemyPos) <= TORPEDO_RANGE) {
            command = command + " | TORPEDO " + currentEnemyPos.xPos + " " + currentEnemyPos.yPos;
        }
    }

    return command;
}

function calculateStartLocation(): MapPos {
    let xPos: number = Math.floor(Math.random()*width);
    let yPos: number = Math.floor(Math.random()*height);
    // let xPos: number = 0;
    // let yPos: number = 14;
    let mapPos: MapPos = map.get(xPos + "-" + yPos);
    while(!isPositionLegal(mapPos)) {
        const northPos: MapPos = map.get(createMapId(mapPos.xPos, mapPos.yPos + NORTH));
        const eastPos: MapPos = map.get(createMapId(mapPos.xPos + EAST, mapPos.yPos));
        const southPos: MapPos = map.get(createMapId(mapPos.xPos, mapPos.yPos + SOUTH));
        const westPos: MapPos = map.get(createMapId(mapPos.xPos + WEST, mapPos.yPos));
        // Check if North is ok in bounds and is not land
        if( northPos && isPositionLegal(northPos) ) {
            mapPos = northPos;
        } else if ( eastPos && isPositionLegal(eastPos)) {  
            mapPos = eastPos;
        } else if ( southPos && isPositionLegal(southPos)) {
            mapPos = southPos;
        } else if ( westPos && isPositionLegal(westPos)) {
            mapPos = westPos;
        } else {
            xPos = Math.floor(Math.random()*width);
            yPos = Math.floor(Math.random()*height);
            mapPos = map.get(xPos + "-" + yPos);
        }
    }
    return mapPos;   
}

/***************** MAIN GAME LOOPS *****************/
/**
 * Initial Info... Map info
 **/
var inputs: string[] = readline().split(' ');
const width: number = parseInt(inputs[0]);
const height: number = parseInt(inputs[1]);
const myId: number = parseInt(inputs[2]);

console.error("Width: " + width);
console.error("Height: " + height);
console.error("MyId: " + myId);

// Loop over the map
for (let i = 0; i < height; i++) {
    const line: string = readline();
    // console.error("Index Height: " + i + " line info: " + line);
    for( let j = 0; j < width; j++) {
        const key = createMapId(j, i);
        const mapPos = new MapPos(key, j, i);
        if(line[j] == "x") {
            mapPos.isLand = true;
        }
        
        calculateSectorValue(mapPos);        
        map.set(key, mapPos);
        potentialEnemyPositions.push(mapPos);
        // console.error("Created MapPos: " + mapPos.toString());
    }    
}

// Write an action using console.log()
// To debug: console.error('Debug messages...');

let xStartPos:number = 0;
let yStartPos:number = 0;

calculateAllMaxDirections();

myCurrentPos = calculateStartLocation();
xStartPos = myCurrentPos.xPos;
yStartPos = myCurrentPos.yPos;

// Output starting location!
console.log(xStartPos + " " + yStartPos);
console.error("Starting Main Loop! Start positions is: " + xStartPos + ", " + yStartPos);
// game loop
while (true) {
    var inputs: string[] = readline().split(' ');
    const x: number = parseInt(inputs[0]);
    const y: number = parseInt(inputs[1]);
    const myLife: number = parseInt(inputs[2]);
    const oppLife: number = parseInt(inputs[3]);
    const torpedoCooldown: number = parseInt(inputs[4]);
    const sonarCooldown: number = parseInt(inputs[5]);
    const silenceCooldown: number = parseInt(inputs[6]);
    const mineCooldown: number = parseInt(inputs[7]);
    const sonarResult: string = readline();
    const enemyOrders: string = readline();
    
    currentLife = myLife;
    currentOppenentLife = oppLife;
    currentTorpedoCooldown = torpedoCooldown;
    currentSonarCooldown = sonarCooldown;
    currentSilenceCooldown = silenceCooldown;
    currentMineCooldown = mineCooldown;
    currentSonarResult = sonarResult;


    console.error("MyLife: " + myLife);
    console.error("Oppenent Life: " + oppLife);
    console.error("Torpedo Cooldown: " + torpedoCooldown);
    console.error("Sonar Cooldown: " + sonarCooldown);
    console.error("Silence Cooldown: " + silenceCooldown);
    console.error("Mine Cooldown: " + mineCooldown);
    console.error("sonarResult: " + sonarResult);
    console.error("enemyOrders: " + enemyOrders);

    myCurrentPos.weHaveBeen = true;
    myCurrentPos = map.get(createMapId(x,y));

    calculateEnemyPos( enemyOrders.split("|")); 

    const nextCommand: string = calculateNextMove();
    // Write an action using console.log()
    // To debug: console.error('Debug messages...');

    if(nextCommand.includes("SURFACE")) {
        clearHasBeenThere();
    }

    console.log(nextCommand);
}