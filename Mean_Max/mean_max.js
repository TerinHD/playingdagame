// List of Improvements
/*

Reaper Improvements:

1. Cluster Wrecks and track towards highest density
2. Move away from others when no active wrecks
3. Continue towards target given specific target (calculating stops)
4. Ensure target is accessible (no tanker sitting on top, no oil spill)

Destroyer Improvements:


1. Either:
    A. Ram other reapers... maybe target one and have the doof target the 2nd?
    B. Avoid all other others and focus on tankers.Improvements
2. Only target full tankers rather than empty tankers

Doof Improvements:

2. Oil the wrecks closest to the 

Overall:

?
*/

// Arena Objects
// Static Variables

function Arena() {
    var xPos = 0;
    var yPos = 0;
    var radius = 6000;
}

function WaterTown() {
    var xPos = 0;
    var yPos = 0;
    var radius = 3000;
}

var arena = new Arena();
arena.xPos = 0;
arena.yPos = 0;
arena.radius =  6000;

var waterTown = new WaterTown();
waterTown.xPos = 0;
waterTown.yPos = 0;
waterTown.radius = 3000;

// Definited Objects

function Reaper() {
    var unitId = -1;
    var playerId = -1;
    var mass = -1;
    var radius = -1;
    var xPos = 0;
    var yPos = 0;
    var xVel = 0;
    var yVel = 0;
}

function Destroyer() {
    var unitId = -1;
    var playerId = -1;
    var mass = -1;
    var radius = -1;
    var xPos = 0;
    var yPos = 0;
    var xVel = 0;
    var yVel = 0;
}

function Doof() {
    var unitId = -1;
    var playerId = -1;
    var mass = -1;
    var radius = -1;
    var xPos = 0;
    var yPos = 0;
    var xVel = 0;
    var yVel = 0;
}

function Tanker() {
    var unitId = -1;
    var mass = -1;
    var radius = -1;
    var xPos = 0;
    var yPos = 0;
    var xVel = 0;
    var yVel = 0;
    var waterQuantity = -1;
    var waterCapacity = -1;
}

function Wreck() {
    var unitId = -1;
    var radius = -1;
    var xPos = 0;
    var yPos =0;
    var waterQuantity = -1;
}

function TarPool() {
    var unitId = -1;
    var radius = -1;
    var xPos = 0;
    var yPos = 0;
}

function OilPool() {
    var unitId = -1;
    var radius = -1;
    var xPos = 0;
    var yPos = 0;
}

function Point() {
    var xPos = 0;
    var yPos = 0;
}

// Create & Update Methods for Objects

function createUpdateReaper( unitId, inputs ) {
    var tmpReaper;
    if( reapers[unitId] ) {
        tmpReaper = reapers[unitId];
    } else {
        tmpReaper = new Reaper();
        tmpReaper.unitId = unitId;
        reapers[unitId] = tmpReaper;
    }
    
    tmpReaper.playerId = parseInt(inputs[2]);
    
    if( tmpReaper.playerId === 0 && !myReaper) {
        myReaper = tmpReaper;
    }
    
    tmpReaper.mass = parseFloat(inputs[3]);
    tmpReaper.radius = parseInt(inputs[4]);
    tmpReaper.xPos = parseInt(inputs[5]);
    tmpReaper.yPos = parseInt(inputs[6]);
    tmpReaper.xVel = parseInt(inputs[7]);
    tmpReaper.yVel = parseInt(inputs[8]);  
    
    tmpReaper.friction = 0.2;
    
    return tmpReaper;
}

function createUpdateDestroyer( unitId, inputs ) {
    var tmpDestroyer;
    if( destroyers[unitId] ) {
        tmpDestroyer = destroyers[unitId];
    } else {
        tmpDestroyer = new Destroyer();
        tmpDestroyer.unitId = unitId;
        destroyers[unitId] = tmpDestroyer;
    }
    
    tmpDestroyer.playerId = parseInt(inputs[2]);
    
    if( tmpDestroyer.playerId === 0 && !myDestroyer) {
        myDestroyer = tmpDestroyer;
    }
    
    tmpDestroyer.mass = parseFloat(inputs[3]);
    tmpDestroyer.radius = parseInt(inputs[4]);
    tmpDestroyer.xPos = parseInt(inputs[5]);
    tmpDestroyer.yPos = parseInt(inputs[6]);
    tmpDestroyer.xVel = parseInt(inputs[7]);
    tmpDestroyer.yVel = parseInt(inputs[8]);
    
    tmpDestroyer.friction = 0.3;
    
    return tmpDestroyer;
}

function createUpdateDoof( unitId, inputs ) {
    var tmpDoof;
    if( doofs[unitId] ) {
        tmpDoof = doofs[unitId];
    } else {
        tmpDoof = new Doof();
        tmpDoof.unitId = unitId;
        doofs[unitId] = tmpDoof;
    }
    
    tmpDoof.playerId = parseInt(inputs[2]);
    
    if( tmpDoof.playerId === 0 && !myDoof) {
        myDoof = tmpDoof;
    }
    
    tmpDoof.mass = parseFloat(inputs[3]);
    tmpDoof.radius = parseInt(inputs[4]);
    tmpDoof.xPos = parseInt(inputs[5]);
    tmpDoof.yPos = parseInt(inputs[6]);
    tmpDoof.xVel = parseInt(inputs[7]);
    tmpDoof.yVel = parseInt(inputs[8]);
    
    tmpDoof.friction = 0.3;
    
    return tmpDoof;
}

function createUpdateTanker( unitId, inputs ) {
    var tmpTanker;
    if( tankers[unitId] ) {
        tmpTanker = tankers[unitId];
    } else {
        tmpTanker = new Tanker();
        tmpTanker.unitId = unitId;
        tankers[unitId] = tmpTanker;
    }
    
    tmpTanker.mass = parseFloat(inputs[3]);
    tmpTanker.radius = parseInt(inputs[4]);
    tmpTanker.xPos = parseInt(inputs[5]);
    tmpTanker.yPos = parseInt(inputs[6]);
    tmpTanker.xVel = parseInt(inputs[7]);
    tmpTanker.yVel = parseInt(inputs[8]);
    tmpTanker.waterQuantity = parseInt(inputs[9]);
    tmpTanker.waterCapacity = parseInt(inputs[10]);
    
    tmpTanker.friction = 0.4;
    tmpTanker.throttle = 500;
    
    return tmpTanker;
}


function createUpdateWreck( unitId, inputs ) {
    var tmpWreck;
    if( wrecks[unitId]) {
        tmpWreck = wrecks[unitId];   
    } else {
        tmpWreck = new Wreck();
        tmpWreck.unitId = unitId;
        wrecks[unitId] = tmpWreck;
    }
    
    tmpWreck.radius = parseInt(inputs[4]);
    tmpWreck.xPos = parseInt(inputs[5]);
    tmpWreck.yPos = parseInt(inputs[6]);
    tmpWreck.waterQuantity = parseInt(inputs[9]);
    
    return tmpWreck;
}

function createTarPool( unitId, inputs ) {
    var tmpTarPool = new TarPool();
    tmpTarPool.unitId = unitId;
    tarPools[unitId] = tmpTarPool;
    
    tmpTarPool.radius = parseInt(inputs[4]);
    tmpTarPool.xPos = parseInt(inputs[5]);
    tmpTarPool.yPos = parseInt(inputs[6]);
    
    return tmpTarPool;
}

function createOilPool( unitId, inputs ) {
    var tmpOilPool = new OilPool();
    tmpOilPool.unitId = unitId;
    oilPools[unitId] = tmpOilPool;
    
    tmpOilPool.radius = parseInt(inputs[4]);
    tmpOilPool.xPos = parseInt(inputs[5]);
    tmpOilPool.yPos = parseInt(inputs[6]);
    
    return tmpOilPool;
}

// Logical Utility Methods

function checkInsideRadius( target, vehicle ) {
    var d2 = Math.pow( vehicle.xPos - target.xPos, 2 ) + Math.pow( vehicle.yPos - target.yPos, 2);
    var r2 = Math.pow( target.radius, 2 );
    if( d2 < r2 ) {
        return true;
    }
    return false;
}

function checkInsideRadiusPoints( target, xPos, yPos ) {
    var d2 = Math.pow( xPos - target.xPos, 2 ) + Math.pow( yPos - target.yPos, 2);
    var r2 = Math.pow( target.radius, 2 );
    if( d2 < r2 ) {
        return true;
    }
    return false;
}

function distanceToPoint( vehicle, pointX, pointY ) {
    return Math.sqrt( (vehicle.xPos - pointX) * (vehicle.xPos - pointX) + (vehicle.yPos - pointY) * (vehicle.yPos - pointY));
}

function calculateVehicleTrajectory( vehicle ) {
    var pointToReturn = new Point();
    pointToReturn.xPos = vehicle.xPos + vehicle.xVel;
    pointToReturn.yPos = vehicle.yPos + vehicle.yVel;
    return pointToReturn;
}

function distanceToVehicle( vehicle1, vehicle2 ) {
    return distanceToPoint( vehicle1, vehicle2.xPos, vehicle2.yPos );  
}

function distanceToVehicleTrajectory( vehicle1, vehicle2 ) {
    var pointInFuture = calculateVehicleTrajectory( vehicle2 );
    return distanceToPoint( vehicle1, pointInFuture.xPos, pointInFuture.yPos);
}

function stopVehicle( vehicle ) {
    var xDir = vehicle.xPos - vehicle.xVel;
    var yDir = vehicle.yPos - vehicle.yVel;
    var dist = distanceToPoint( vehicle, xDir, yDir );
    var power = Math.abs(Math.round(dist * vehicle.mass));
    printErr( "Power for stop: " + power ); 
    if( power > 300 ) {
        power = 300;   
    }
    return '' + xDir + ' ' + yDir + ' ' + power;
}

function navigateToPoint( vehicle, pointX, pointY) {
    
    // printErr( "Destination: " + pointX + ", " + pointY );
    // printErr( "Velocity: " + vehicle.xVel + ", " + vehicle.yVel );
    // printErr( "Vehicle Position: " + vehicle.xPos + ", " + vehicle.yPos );
    // var xPos = pointX - vehicle.xVel - vehicle.xPos;
    // var yPos = pointY - vehicle.yVel - vehicle.yPos;
    // printErr( "Possible Correction Vector: "  + xPos + ", " + yPos );
    
    // var dist = distanceToPoint( vehicle, xPos, yPos);
    var dist = distanceToPoint( vehicle, pointX, pointY);
    var power = dist * vehicle.mass;
    power = Math.abs(Math.round(power));
    printErr( "Power for Navigation: " + power ); 
    if( power > 300 ) {
        var division = power / 300;
        power = Math.round( power / division );   
    }
    
    return '' + pointX + ' ' + pointY + ' ' + power;
}

function navigateToVehicle( vehicle1, vehicle2) {
    var targetVehiclePoint = calculateVehicleTrajectory( vehicle2 );
    return navigateToPoint( vehicle1, targetVehiclePoint.xPos, targetVehiclePoint.yPos );
}

function navigateToClosestWreck( reaper, wrecks, backupAction ) {
    var targetWreck = null;
    var closestDist = null;
    var countWrecks = 0;
    for (var key in wrecks) {
        if (wrecks.hasOwnProperty(key) ) {
            countWrecks += 1;
            var tmpWreck = wrecks[key];
            var tmpDist = distanceToVehicle( reaper, tmpWreck );
            if(!targetWreck && tmpDist >= 0 ) {
                targetWreck = tmpWreck;
                closestDist = tmpDist;
            } else {
                if( tmpDist < closestDist && tmpDist >= 0) {
                    targetWreck = tmpWreck;
                }
            }
        } 
    }
    
    if( targetWreck ) {
        printErr( "Navigate Reaper to Wreck");
        return navigateToPoint( reaper, targetWreck.xPos, targetWreck.yPos);
    } else {
        return backupAction;
    }
}

function navigateToClosestTankers( vehicle, vehicles, backupAction ) {
    var targetVehicle = null;
    var closestDist = null;
    for (var key in vehicles) {
        if (vehicles.hasOwnProperty(key) ) {
            var tmpVehicle = vehicles[key];
            var insideArena = checkInsideRadiusPoints( arena, tmpVehicle.xPos, tmpVehicle.yPos )
            if( insideArena ) {
                var tmpDistToVehicle = distanceToVehicle( vehicle, tmpVehicle );
                var tmpDistToVehicleTraj = distanceToVehicleTrajectory( vehicle, tmpVehicle );
                if(!targetVehicle ) {
                    targetVehicle = tmpVehicle;
                    closestDist = tmpDistToVehicle;
                } else {
                    if( tmpDistToVehicle < closestDist ) {
                        targetVehicle = tmpVehicle;
                    }
                }
            }
        } 
    }
    
    if( targetVehicle ) {
        return navigateToVehicle( vehicle, targetVehicle);
    } else {
        return backupAction;
    }
}

function navigateToClosestEnemy( vehicle, vehicles, backupAction ) {
    var targetVehicle = null;
    var closestDist = null;
    for (var key in vehicles) {
        if (vehicles.hasOwnProperty(key) ) {
            var tmpVehicle = vehicles[key];
            if( !(tmpVehicle.playerId === 0) ) {
                var tmpDistToVehicle = distanceToVehicle( vehicle, tmpVehicle );
                if(!targetVehicle) {
                    targetVehicle = tmpVehicle;
                    closestDist = tmpDistToVehicle;
                } else {
                    if( tmpDistToVehicle < closestDist) {
                        targetVehicle = tmpVehicle;
                    }
                }
            }
        } 
    }
    
    if( targetVehicle ) {
        return navigateToPoint( vehicle, targetVehicle.xPos, targetVehicle.yPos);
    } else {
        return backupAction;
    }
}



function vehicleInWreck( vehicle, wrecks ) {
    var results = {};
    results.inside = false;
    results.wreck = null;
    for (var key in wrecks) {
        if (wrecks.hasOwnProperty(key) ) {
            var tmpWreck = wrecks[key];
            if( checkInsideRadius( tmpWreck, vehicle ) ) {
                results.inside = true;   
                results.wreck = tmpWreck;
                break;
            }
        } 
    }
    return results;
}

function oilSpill( vehicle, reapers, wrecks ) {
    var resultsOilSpill = {};
    resultsOilSpill.viableTarget = false;
    resultsOilSpill.action = "WAIT";
    var targetWreck = null;
    for (var key in reapers) {
        if (reapers.hasOwnProperty(key) ) {
            var tmpVehicle = reapers[key];
            if( !(reapers.playerId === 0) ) {
                var tmpDistToVehicle = distanceToVehicle( vehicle, tmpVehicle );
                if( tmpDistToVehicle < 2000  ) {
                    var results = vehicleInWreck( tmpVehicle, wrecks );
                    if(results.inside && !checkInsideRadius( results.wreck, myReaper ) && distanceToVehicle( vehicle, results.wreck ) < 2000 ) {
                        targetWreck = results.wreck;
                    }
                }
            }
        } 
    }
    
    if( targetWreck ) {
        resultsOilSpill.viableTarget = true;
        resultsOilSpill.action = "SKILL " + targetWreck.xPos + " " + targetWreck.yPos;
    }
    
    return resultsOilSpill;
}

// Vehicle Lists
var reapers = {};
var reaperIds = [];

var destroyers = {};
var doofs = {};
var tankers = {};

// Wrecks
var wrecks = {};


// Pools
var tarPools = {};
var oilPools = {};

// ******** My Vehicles ******** //

// Reaper Variables
var myReaper;

// Destroyer Variables
var myDestroyer;


// Doof Variables
var myDoof;
var turnCount = 0;
var xDesiredPos = -4000;
var yDesiredPos = -4000;
var xAdd = true;
var yAdd = true;

// game loop
while (true) {
    
    turnCount++;
    
    var reaperAction = 'WAIT';
    var destroyerAction = 'WAIT';
    var doofAction = 'WAIT';
    
    var myScore = parseInt(readline());
    var enemyScore1 = parseInt(readline());
    var enemyScore2 = parseInt(readline());
    var myRage = parseInt(readline());
    var enemyRage1 = parseInt(readline());
    var enemyRage2 = parseInt(readline());
    
    
    var unitCount = parseInt(readline());
    
    var topWaterQuantity = 0;
    var topWreckId = -1;
    var targetWreck = null;
    
    // Clear Tankers & Wrecks
    var countWrecksInInput = 0;
    wrecks = {};
    tankers = {};
    tarPools = {};
    oilPools = {};
    var lastTankerId = -1;
    
    var reaperInsideWreck = false;

    for (var i = 0; i < unitCount; i++) {
        var inputs = readline().split(' ');
        var unitId = parseInt(inputs[0]);
        var unitType = parseInt(inputs[1]);
        if( unitType === 0 ) {
            createUpdateReaper( unitId, inputs );
            if( !reaperIds[unitId] ) {
                reaperIds.push(unitId);   
            }
        } else if( unitType === 1) {
            createUpdateDestroyer( unitId, inputs );
        } else if( unitType === 2) {
            createUpdateDoof( unitId, inputs );
        } else if( unitType === 3) {
            createUpdateTanker( unitId, inputs );
            lastTankerId = unitId;
        } else if( unitType === 4 ) {
            var tmpWreck = createUpdateWreck( unitId, inputs );
            countWrecksInInput += 1;
            // if( tmpWreck.waterQuantity > topWaterQuantity ) {
            //     topWreckId = unitId;
            //     topWaterQuantity = tmpWreck.waterQuantity;
            // }
            
            if( checkInsideRadius( tmpWreck, myReaper ) && !reaperInsideWreck) {
                reaperInsideWreck = true;   
                targetWreck = tmpWreck;
            }
        } else if( unitType === 5) {
            createTarPool( unitId, inputs );   
        } else if( unitType === 6) {
            createOilPool( unitId, inputs );
        }

        // var player = parseInt(inputs[2]);
        // var mass = parseFloat(inputs[3]);
        // var radius = parseInt(inputs[4]);
        // var x = parseInt(inputs[5]);
        // var y = parseInt(inputs[6]);
        // var vx = parseInt(inputs[7]);
        // var vy = parseInt(inputs[8]);
        // var extra = parseInt(inputs[9]);
        // var extra2 = parseInt(inputs[10]);
    }
    
    // Calculate Reaper Actions
    printErr( "*********** Calc Reaper Action " );
    if( reaperInsideWreck ) {
        if( myReaper.xVel === 0 && myReaper.yVel == 0 ) {
            reaperAction = navigateToPoint( myReaper, targetWreck.xPos, targetWreck.yPos);
            // reaperAction = 'WAIT';   
        } else {
            reaperAction = stopVehicle( myReaper );   
        }
    } else {
        // if( topWreckId !== -1 ) {
        //     var tmpWreck = wrecks[topWreckId];
        //     reaperAction = navigateToPoint( myReaper, tmpWreck.xPos, tmpWreck.yPos );
        // } else {
            // reaperAction = stopVehicle( myReaper );
        // }
        
        // var backupAction = stopVehicle( myReaper );
        // if( myRage > 60 ) {
        //     backupAction = targetTarSkill( myReaper, reapers,   );   
        // } else {
        printErr( " CALC Nav to Destroyer" );
        var    backupAction = navigateToVehicle( myReaper, myDestroyer );
        // var backupAction = navigateToPoint( myReaper, 0, 0);
        // }
        printErr( " CALC Nav to Closest Wreck" );
        reaperAction = navigateToClosestWreck( myReaper, wrecks, backupAction );
    }
    printErr( "*********** Reaper Action: " + reaperAction );
    
    
    
    // Calculate Destroyer Actions
    printErr( "$$$$$$$$$ Calc Destroyer Action " );
    destroyerAction = navigateToClosestTankers( myDestroyer, tankers, "WAIT" );
    printErr( "$$$$$$$$$ Destroyer Action: " + destroyerAction );
    
    
    // Calculate Doof Actions
    
    printErr("@@@@@@@@@@ Calc Doof Action" );
    var backupAction = "WAIT";
    if( myRage > 90 ) {
        var resultsOilSpill = oilSpill( myDoof, reapers, wrecks );
        if( resultsOilSpill.viableTarget ) {
            doofAction = resultsOilSpill.action;
        } else {
            doofAction = navigateToClosestEnemy( myDoof, reapers, "WAIT");
        }
    } else {
        doofAction = navigateToClosestEnemy( myDoof, reapers, "WAIT");
    }
    printErr( "@@@@@@@@@@ Doof Action: " + doofAction );
    
    // Report Our Actions

    print( reaperAction + " Larry" );
    print( destroyerAction + " Curly" );
    print( doofAction + " Moe" );
}