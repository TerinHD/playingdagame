/**
 * Things to consider doing:
 * 
 * Better item selection?  
 * 
 * Never engage enemy tower...
 * 
 * FIX THE DAMN Y axis... and retreat distance for melee... fine for moving forward...
 * 
 * If lane is pushed pull back and jungle... get some more gold for items.
 *  
 * Branch out into new character types...
 * 
 * Start using predictives...
 * 
 * Select 2nd Hero based on First Selection and enemy selection.
 */
 
 
 /************************************* Datatypes *****************************************/
function Unit() {
    var unitId;
    var team;
    var unitType;
    var position;
    var attackRange;
    var health;
    var maxHealth;
    var shield;
    var attackDamage;
    var movementSpeed;
    var stunDuration;
    var goldValue;
    var countdown1;
    var countdown2;
    var countdown3;
    var mana;
    var maxMana;
    var manaRegeneration;
    var heroType;
    var isVisible;
    var itemsOwned;
    var damageTaken;
}

function Bush() {
    var position;
    var radius;
}

function Spawn() {
    var position;
    var radius;
}

function Item() {
    var itemName;
    var itemCost;
    var damage;
    var health;
    var maxHealth;
    var mana;
    var maxMana;
    var movementSpeed;
    var manaRegeneration;
    var isPotion;
}

function Position() {
    var x;
    var y;
}

/*********************************** Utility Methods *******************************************/
function distance( position1, position2 ) {
    return Math.sqrt( (position1.x - position2.x) * (position1.x - position2.x) + (position1.y - position2.y) * (position1.y - position2.y));
}

function storeUnitInfo( unit, unitId, team, inputs  ) {
    unit.unitId = unitId;
    unit.team = team;
    unit.position = new Position();
    unit.position.x = parseInt(inputs[3]);
    unit.position.y = parseInt(inputs[4]);
    unit.attackRange = parseInt(inputs[5]);
    var mobHealth = parseInt(inputs[6]);
    unit.damageTaken = unit.health ? unit.health > mobHealth : false;
    unit.health = mobHealth;
    unit.maxHealth = parseInt(inputs[7]);
    unit.shield = parseInt(inputs[8]); // useful in bronze
    unit.attackDamage = parseInt(inputs[9]);
    unit.movementSpeed = parseInt(inputs[10]);
    unit.stunDuration = parseInt(inputs[11]); // useful in bronze
    unit.goldValue = parseInt(inputs[12]);
    unit.countDown1 = parseInt(inputs[13]); // all countDown and mana variables are useful starting in bronze
    unit.countDown2 = parseInt(inputs[14]);
    unit.countDown3 = parseInt(inputs[15]);
    unit.mana = parseInt(inputs[16]);
    unit.maxMana = parseInt(inputs[17]);
    unit.manaRegeneration = parseInt(inputs[18]);
    unit.isVisible = parseInt(inputs[20]); // 0 if it isn't
    unit.itemsOwned = parseInt(inputs[21]); // useful from wood1   
}

/*********************************** Parse Initial Information *******************************************/


// Setup Team Parameters
var myTeam = parseInt(readline());

var startXTeam0 = 200;
var startXTeam1 = 1720;

var startX = myTeam === 0 ? startXTeam0 : startXTeam1;
var retreatDirection = startX > 960 ?  1 : -1; 
var forwardDirection = retreatDirection > 0 ? -1 : 1;

// Read in and Configure Bushes and Spawn Points
var bushes = [];
var bushAndSpawnPointCount = parseInt(readline()); // usefrul from wood1, represents the number of bushes and the number of places where neutral units can spawn
for (var i = 0; i < bushAndSpawnPointCount; i++) {
    var inputs = readline().split(' ');
    var entityType = inputs[0]; // BUSH, from wood1 it can also be SPAWN
    
    if( entityType === "BUSH" ) {
        var tmpBush = new Bush();
        var tmpPos = new Position();
        tmpPos.x = parseInt(inputs[1]);
        tmpPos.y = parseInt(inputs[2]);
        tmpBush.position = tmpPos;
        tmpBush.radius = parseInt(inputs[3]);
        
        // printErr("Bush: ");
        // printErr(JSON.stringify(tmpBush));
    } else if( entityType === "SPAWN" ) {
        var tmpSpawn = new Spawn();
        var tmpPos = new Position();
        tmpPos.x = parseInt(inputs[1]);
        tmpPos.y = parseInt(inputs[2]);
        tmpSpawn.position = tmpPos;
        tmpSpawn.radius = parseInt(inputs[3]);   
        
        // printErr("Spawn: ");
        // printErr(JSON.stringify(tmpSpawn));
    }
}

// Read in and Configure Items
var items = new Map();
var healingPotions = [];
var manaPotions = [];
var dmgItems = [];
var healthItems = [];
var manaItems = [];
var moveSpeedItems = [];
var manaRegenItems = [];
var itemCount = parseInt(readline()); // useful from wood2
for (var i = 0; i < itemCount; i++) {
    var inputs = readline().split(' ');
    
    var tmpItem = new Item();
    
    tmpItem.itemName = inputs[0]; // contains keywords such as BRONZE, SILVER and BLADE, BOOTS connected by "_" to help you sort easier
    tmpItem.itemCost = parseInt(inputs[1]); // BRONZE items have lowest cost, the most expensive items are LEGENDARY
    tmpItem.damage = parseInt(inputs[2]); // keyword BLADE is present if the most important item stat is damage
    tmpItem.health = parseInt(inputs[3]);
    tmpItem.maxHealth = parseInt(inputs[4]);
    tmpItem.mana = parseInt(inputs[5]);
    tmpItem.maxMana = parseInt(inputs[6]);
    tmpItem.moveSpeed = parseInt(inputs[7]); // keyword BOOTS is present if the most important item stat is moveSpeed
    tmpItem.manaRegeneration = parseInt(inputs[8]);
    tmpItem.isPotion = parseInt(inputs[9]); // 0 if it's not instantly consumed
    
    items.set(tmpItem.itemName, tmpItem);
    
    // printErr(JSON.stringify(tmpItem));
    if( tmpItem.damage > 0 && tmpItem.itemName.includes("Blade")) {
        dmgItems.push(tmpItem);   
    }
    
    if( tmpItem.health > 0 && tmpItem.isPotion === 1 ) {
        healingPotions.push(tmpItem);   
    }
    
    if( tmpItem.mana > 0 && tmpItem.isPotion === 1 ) {
        manaPotions.push(tmpItem);
    }
    
    if( tmpItem.maxHealth > 0 ) {
        healthItems.push(tmpItem);
    }
    
    if( tmpItem.maxMana > 0 ) {
        manaItems.push(tmpItem);   
    }
    
    if( tmpItem.moveSpeed > 0 && tmpItem.itemName.includes("Boots")) {
        moveSpeedItems.push(tmpItem);   
    }
    
    if( tmpItem.manaRegeneration > 0 ) {
        manaRegenItems.push(tmpItem);
    }
    
    // printErr("Item: ");
    // printErr(JSON.stringify(tmpItem));
}

// Sort Lists
if( dmgItems.length > 0 ) {
    dmgItems.sort(function(a,b) {return b.itemCost - a.itemCost;} );
}
// printErr( "Dmg Items: " + JSON.stringify(dmgItems));

if( healingPotions.length > 0 ) {
    healingPotions.sort(function(a,b) {return b.itemCost - a.itemCost} );
}

if( manaPotions.length > 0 ) {
    manaPotions.sort(function(a,b) {return b.itemCost - a.itemCost;} );
}

if( healthItems.length > 0 ) {
    healthItems.sort(function(a,b) {return b.itemCost - a.itemCost} );
}

if( manaItems.length > 0 ) {
    manaItems.sort(function(a,b) {return b.itemCost - a.itemCost} );
}

if( moveSpeedItems.length > 0 ) {
    moveSpeedItems.sort(function(a,b) {return b.itemCost - a.itemCost;} );
}

if( manaRegenItems.length > 0 ) {
    manaRegenItems.sort(function(a,b) {return b.itemCost - a.itemCost} );
}



/*********************************** Start Initial Strategies *******************************************/

// Set up Strategy Here

var deadpool = "DEADPOOL";
var ironman = "IRONMAN";
var hulk = "HULK";
var valkyrie = "VALKYRIE";
var drStrange ="DOCTOR_STRANGE";

var sentFirstHeroSelection = false;
var firstSelectedHero = ironman;
var secondSelectedHero = drStrange;

// var firstSelection = Math.floor(Math.random() * 5); 
// var secondSelection = Math.floor(Math.random() * 5); 
// while( firstSelection === secondSelection ) {
//     secondSelection = Math.floor(Math.random() * 5); 
// }

// if( firstSelection === 0 ) {
//     firstSelectedHero = deadpool;
// } else if( firstSelection === 1 ) {
//     firstSelectedHero = ironman;
// } else if( firstSelection === 2 ) {
//     firstSelectedHero = hulk;
// } else if( firstSelection === 3 ) {
//     firstSelectedHero = valkyrie;
// } else if( firstSelection === 4 ) {
//     firstSelectedHero = drStrange;
// }

// if( secondSelection === 0 ) {
//     secondSelectedHero = deadpool;
// } else if( secondSelection === 1 ) {
//     secondSelectedHero = ironman;
// } else if( secondSelection === 2 ) {
//     secondSelectedHero = hulk;
// } else if( secondSelection === 3 ) {
//     secondSelectedHero = valkyrie;
// } else if( secondSelection === 4 ) {
//     secondSelectedHero = drStrange;
// }

// My Units

var my1stHero = new Unit();
my1stHero.heroType = firstSelectedHero;

var my2ndHero = new Unit();
my2ndHero.heroType = secondSelectedHero;

var myMobs = new Map();
var myOldMobs = new Map();
var myTower = new Unit();

// Opposition Heroes

var foe1stHero = new Unit();
foe1stHero.unitId = -1;
var foe2ndHero = new Unit();
foe2ndHero.unitId = -1;

var foeMobs = new Map();
var foeOldMobs = new Map();
var foeTower = new Unit();

// Groots
var groots = new Map();
var oldGroots = new Map();

// My Value & Item Management
var myCurrentItemWealth = 0;
var myCurrentWealth = 0;

var currentGold = 0;

var my1stHeroItems = [];
var my1stHeroLowestCostItem = null;
var my2ndHeroItems = [];
var my2ndHeroLowestCostItem = null;

var heroSellingItem = false;

/*********************************** Tuning Settings *******************************************/

var healthPercentToGetPotions = 0.4;
var healthPercentToAOEHeal = 0.75;

// Retreat Ranges
var retreatDistRangedHeroes = 130;
var retreatDistMeleeHeroes = 5;
var fullRetreat = 150;

// Round Counter
var roundCounter = 0;


/*********************************** Game Functions *******************************************/

function set1stHeroLowestCostItem( item ) {
	my1stHeroLowestCostItem = item;
}

function set2ndHeroLowestCostItem( item ) {
	my2ndHeroLowestCostItem = item;
}

function processHeroAction( heroToProcess, otherHero, denyTarget, lastHitTarget, foeUnitLowestHealth, heroPosition, heroItems, heroLowestCostItem, setLowestCostItem ) {
	
	var heroAction = "WAIT";

	// printErr("Hero1 ALIVE!");
	// Calculate in Range for Heroes vs Heroes
	var foe1stHeroInRange = foe1stHero.isVisible === 1 ? distance( heroPosition, foe1stHero.position) <= heroToProcess.attackRange : false;
	var foe2ndHeroInRange = foe2ndHero.isVisible === 1 ? distance( heroPosition, foe2ndHero.position) <= heroToProcess.attackRange : false;
	var foeHeroTarget = foe1stHeroInRange && foe2ndHeroInRange ? (foe1stHero.health < foe2ndHero.health ? foe1stHero : foe2ndHero) : (foe1stHeroInRange ?  foe1stHero : ( foe2ndHeroInRange ? foe2ndHero : null));
	var enemyTowerInRange = distance( heroPosition, foeTower.position) <= heroToProcess.attackRange;
	
	// Calculate if my Heroes Need Potions
	var heroNeedsPotion =  (heroToProcess.health/ heroToProcess.maxHealth < healthPercentToGetPotions);
	
	var heroItemAction = false;
	
	if( heroNeedsPotion ) {
		var hpNeedingHealing = heroToProcess.maxHealth - heroToProcess.health;
		healingPotions.forEach( function(item) {
			// printErr( "ItemCost: " + item.itemCost + " MY GOLD: " + currentGold);
			if( item.itemCost < currentGold  && !heroItemAction) { //&& item.health <= hpNeedingHealing
				currentGold = currentGold - item.itemCost;
				heroItemAction = true;
				heroAction = "BUY " + item.itemName + ";";
			}
		});
	} 
	
	var heroItemList = null;
	if( heroToProcess.heroType === ironman) {
		if( dmgItems.length > 0 ) {
			heroItemList = dmgItems;
		} else {
			heroItemList = healthItems;
		}
	} else if ( heroToProcess.heroType === drStrange ) {
		if( manaRegenItems.length > 0 ) {
			heroItemList = manaRegenItems;
		} else {
			heroItemList = healthItems;
		}
	} else {
		if( dmgItems.length > 0 ) {
			heroItemList = dmgItems;
		} else {
			heroItemList = healthItems;
		}
	}
	
	if( heroItemList.length > 0 && heroToProcess.itemsOwned < 3 ) { //&& currentGold > 500 ) {
		heroItemList.forEach( function(item) {
			if( item.itemCost < currentGold  && !heroItemAction) { 
				currentGold = currentGold - item.itemCost;
				myCurrentItemWealth = myCurrentItemWealth + Math.floor(item.itemCost * 0.5 );
				heroItems.push(item);
				
				if( !heroLowestCostItem || heroLowestCostItem.itemCost > item.itemCost ) {
					setLowestCostItem(item);
				}
				
				heroItemAction = true;
				heroAction = "BUY " + item.itemName + "; SHINY!";
			}
		});
	} 
	else if( heroItemList.length > 0 && !heroSellingItem )  {
		heroItemList.forEach( function(item) {
			if( item.itemCost < (currentGold +  Math.floor(heroLowestCostItem.itemCost * 0.5)) && !heroItemAction && item.itemCost > heroLowestCostItem.itemCost ) { 
				// printErr( "Item To Purchase Cost: " + item.itemCost + " LowestCostItem: " + heroLowestCostItem.itemCost);
				myCurrentItemWealth = myCurrentItemWealth - Math.floor(heroLowestCostItem.itemCost * 0.5 );
				
				var foundItem = false;
				var itemToSell = null;
				var newEquipedItems = [];
				var newLowestCostItem = null;
				while ( heroItems.length > 0 ) {
					var tmpItem = heroItems.shift();
					
					if( tmpItem.itemName === heroLowestCostItem.itemName && !foundItem ) {
						foundItem = true;
						itemToSell = tmpItem;
					} else {
						newEquipedItems.push(tmpItem);   
						if( !newLowestCostItem || newLowestCostItem.itemCost > tmpItem.itemCost ) {
							newLowestCostItem = tmpItem;
						}
					}
				}
				if( itemToSell ) {
					setLowestCostItem( newLowestCostItem);
					heroItems = newEquipedItems;
					heroSellingItem = true;
					heroItemAction = true;
					heroAction = "SELL " + itemToSell.itemName;
				}
			}
		});
	}
	
	if( !heroItemAction ) {
		
		var heroUsingSkill = false;
		if( heroToProcess.heroType === ironman) {
			if ( heroToProcess.mana > 50 && heroToProcess.countDown3 == 0 && !heroToProcess.damageTaken) {
				if( heroToProcess.position.x === heroPosition.x ) {
					heroUsingSkill = true;
					if ( foeHeroTarget ) { 
						heroAction = 'BURNING ' + foeHeroTarget.position.x + ' ' + foeHeroTarget.position.y;
					} else if ( lastHitTarget ) {
						heroAction = 'BURNING ' + lastHitTarget.position.x + ' ' + lastHitTarget.position.y;
					} else if ( enemyTowerInRange ) {
						heroAction = 'BURNING ' + foeTower.position.x + ' ' + foeTower.position.y;
					} else {
						heroUsingSkill = false;
					}
				} 
			} 
		} else if( heroToProcess.heroType === drStrange) {
			
			var otherHeroInRangeOfHeals = distance( otherHero.position, heroToProcess.position) <= 250;
			var otherHeroHealthLow = (otherHero.health / otherHero.maxHealth) < healthPercentToAOEHeal;
			
			if ( heroToProcess.mana > 150 && heroToProcess.countDown1 == 0 && !heroToProcess.damageTaken) {
				if(otherHeroHealthLow && otherHeroInRangeOfHeals) {
					heroUsingSkill = true;
					heroAction = 'AOEHEAL ' + otherHero.position.x + ' ' + otherHero.position.y;
				} else if( (heroToProcess.health / heroToProcess.maxHealth ) < healthPercentToAOEHeal ) {
					heroUsingSkill = true;
					heroAction = 'AOEHEAL ' + heroToProcess.position.x + ' ' + heroToProcess.position.y;
				}
			} 
		}
		
		if(!heroUsingSkill) {
		
			if( denyTarget ) {
				heroAction = 'MOVE_ATTACK ' + heroPosition.x + ' ' + heroPosition.y + ' ' + denyTarget.unitId;
			}  else if ( lastHitTarget ) {
				// if( heroToProcess.position.x === heroPosition.x ) {
				//     heroAction = 'ATTACK ' + lastHitTarget.unitId;
				// } else {
					heroAction = 'MOVE_ATTACK ' + heroPosition.x + ' ' + heroPosition.y + ' ' + lastHitTarget.unitId;
				// }
			} else if ( foeHeroTarget ) { 
				heroAction = 'MOVE_ATTACK ' + heroPosition.x + ' ' + heroPosition.y + ' ' + foeHeroTarget.unitId;
			} else if ( foeUnitLowestHealth ) {
				heroAction = 'MOVE_ATTACK ' + heroPosition.x + ' ' + heroPosition.y + ' ' + foeUnitLowestHealth.unitId;
			} else if ( enemyTowerInRange ) {
				heroAction = 'MOVE_ATTACK ' + heroPosition.x + ' ' + heroPosition.y + ' ' + foeTower.unitId;
			} else { 
				// heroAction = "ATTACK_NEAREST UNIT";
				// printErr("DEFAULT ACTION");
				// TODO: SOMETHING ELSE!
				heroAction = 'MOVE ' + heroPosition.x + ' ' + heroPosition.y; // Return Home...
			}
		}
	}
	
	print(heroAction);
}



/*********************************** Start Game Loop *******************************************/
while (true) {
    
    roundCounter++;
	
	heroSellingItem = false;
    
    // Maintain Old Mobs
    myOldMobs = myMobs;
    foeOldMobs = foeMobs;
    oldGroots = groots;
    
    // Clear to determine new mobs and remove dead mobs
    myMobs.clear();
    foeMobs.clear();
    groots.clear();
    
    // Set Alive Parameters for my Heroes
    var my1stHeroAlive = false;
    var my2ndHeroAlive = false;
    
    // Override isVisable to indicate dead Heroes
    foe1stHero.isVisible = 0;
    foe2ndHero.isVisible = 0;
    
    /******************* Start Parsing Inputs **********************/
    currentGold = parseInt(readline());
    // printErr("CurrentGold: " + currentGold);

    myCurrentWealth = currentGold + myCurrentItemWealth;   
    
    var enemyGold = parseInt(readline());
    var roundType = parseInt(readline()); // a positive value will show the number of heroes that await a command
    var entityCount = parseInt(readline());
    for (var i = 0; i < entityCount; i++) {
        var inputs = readline().split(' ');
        var unitId = parseInt(inputs[0]);
        var team = parseInt(inputs[1]);
        var unitType = inputs[2]; // UNIT, HERO, TOWER, can also be GROOT from wood1
        var heroType = inputs[19]; // DEADPOOL, VALKYRIE, DOCTOR_STRANGE, HULK, IRONMAN
        
        if( team === myTeam ) {
            if( unitType === 'TOWER' ) {
                storeUnitInfo(myTower, unitId, team, inputs);
            } else if( unitType === 'HERO' ) {
                if( my1stHero.unitId ) {
                    if( my1stHero.unitId ===  unitId) {
                        storeUnitInfo(my1stHero, unitId, team, inputs);
                        my1stHeroAlive = true;
                    } else if( my2ndHero.unitId ) { 
                        if( my2ndHero.unitId === unitId) {
                            storeUnitInfo(my2ndHero, unitId, team, inputs); 
                            my2ndHeroAlive = true;
                        }
                    } else if( my2ndHero.heroType === heroType ) {
                        storeUnitInfo(my2ndHero, unitId, team, inputs);
                        my2ndHeroAlive = true;
                    }
                    
                } else { // Should only happen if Both Heroes aren't initialized or 2nd is but first isn't
                    if( my1stHero.heroType === heroType ) {
                        storeUnitInfo(my1stHero, unitId, team, inputs);
                        my1stHeroAlive = true;
                    } else if( my2ndHero.heroType === heroType ) {
                        storeUnitInfo(my2ndHero, unitId, team, inputs);
                        my2ndHeroAlive = true;
                    }
                } 
            } else if( unitType === 'UNIT' ) {
                var tmpMob;
                if( myOldMobs.has(unitId) ) {
                    tmpMob = myOldMobs.get(unitId);
                } else {
                    tmpMob = new Unit();
                    tmpMob.unitId = unitId;
                }
                
                storeUnitInfo(tmpMob, unitId, team, inputs);
                
                // printErr( JSON.stringify(tmpMob ));
                myMobs.set( unitId, tmpMob);
            }  
        } else {
            if( unitType === 'TOWER' ) {
                storeUnitInfo(foeTower, unitId, team, inputs);
            } else if( unitType === 'HERO' ) {
                if( foe1stHero.unitId === -1 || foe1stHero.unitId === unitId) {
                    storeUnitInfo(foe1stHero, unitId, team, inputs);
                } else {
                    storeUnitInfo(foe2ndHero, unitId, team, inputs);   
                }
                
            } else if( unitType === 'UNIT' ) {
                var tmpMob;
                if( foeOldMobs.has(unitId) ) {
                    tmpMob = foeOldMobs.get(unitId);
                } else {
                    tmpMob = new Unit();
                    tmpMob.unitId = unitId;
                }
                
                storeUnitInfo(tmpMob, unitId, team, inputs);
                
                // printErr( JSON.stringify(tmpMob ));
                foeMobs.set( unitId, tmpMob);
                
            } else if( unitType === "GROOT") {
                // Neutral Unit...
                
                var tmpMob;
                if( oldGroots.has(unitId) ) {
                    tmpMob = oldGroots.get(unitId);
                } else {
                    tmpMob = new Unit();
                    tmpMob.unitId = unitId;
                }
                
                storeUnitInfo(tmpMob, unitId, team, inputs);
                
                // printErr( JSON.stringify(tmpMob ));
                groots.set( unitId, tmpMob);
            }
        }
        
    }

    /******************* Start Game Logic **********************/

    if( roundType < 0 ) { // If RoundType Negative Select Heroes
        if( !sentFirstHeroSelection ) {
            my1stHeroAction = my1stHero.heroType;   
            print(my1stHeroAction);
            sentFirstHeroSelection = true;
        } else {
            my2ndHeroAction = my2ndHero.heroType;
            print(my2ndHeroAction);
        }
    } else {
        
        var furthestXmy1stHero = null;
        var furthestXmy2ndHero = null;
        var denyTarget1my1stHero = null;
        var denyTarget1my2ndHero = null;
        var denyTarget2my2ndHero = null;
        if ( myMobs.size > 0 ) {
            myMobs.forEach( function( mob, unitId ) {
                if( !furthestXmy1stHero || (forwardDirection > 0 && furthestXmy1stHero < mob.position.x) || (forwardDirection < 0 && furthestXmy1stHero > mob.position.x)) {
                    furthestXmy1stHero = mob.position.x;
                }
                
                if( !furthestXmy2ndHero || (forwardDirection > 0 && furthestXmy2ndHero < mob.position.x) || (forwardDirection < 0 && furthestXmy2ndHero > mob.position.x)) {
                    furthestXmy2ndHero = mob.position.x;
                }
                            
                if( my1stHeroAlive ) {
                    if ( (mob.health < my1stHero.attackDamage )) {
                         if( !denyTarget1my1stHero) {
                             denyTarget1my1stHero = mob;
                         } else {
                             if( denyTarget1my1stHero.health > mob.health ) {
                                denyTarget1my1stHero = mob;
                             }
                         }
                    } 
                }
                
                if( my2ndHeroAlive ) {
                    if ( (mob.health < my2ndHero.attackDamage )) {
                         if( !denyTarget1my2ndHero) {
                             denyTarget1my2ndHero = mob;
                         } else {
                             if( denyTarget1my2ndHero.health > mob.health ) {
                                denyTarget2my2ndHero = denyTarget1my2ndHero;
                                denyTarget1my2ndHero = mob;
                             } else {
                                if( !denyTarget2my2ndHero ) {
                                    denyTarget2my2ndHero = mob;       
                                } else {
                                    if( denyTarget2my2ndHero.health > mob.health ) {
                                        denyTarget2my2ndHero = mob;
                                     }      
                                }
                             }
                         }
                    } 
                }
            });
        } else {
            if( my1stHero.heroType === ironman || my1stHero.heroType === drStrange ) {
                furthestXmy1stHero = (my1stHero.position.x +(forwardDirection * retreatDistRangedHeroes));
            } else {
                furthestXmy1stHero = (my1stHero.position.x +(forwardDirection * retreatDistMeleeHeroes));
            }
            
            if( my2ndHero.heroType === ironman || my2ndHero.heroType === drStrange ) {
                furthestXmy2ndHero = (my2ndHero.position.x +(forwardDirection * retreatDistRangedHeroes));
            } else {
                furthestXmy2ndHero = (my2ndHero.position.x +(forwardDirection * retreatDistMeleeHeroes));
            }
        }
        var my2ndHeroDenyTarget = denyTarget1my2ndHero && (!denyTarget1my1stHero || denyTarget1my2ndHero.unitId != denyTarget1my1stHero.unitId) ? denyTarget1my2ndHero : denyTarget2my2ndHero; 
        
        // Calculate Movement position relative to myMobs
		
		var my1stHeroPosition = new Position();
		if( my1stHero.heroType === ironman || my1stHero.heroType === drStrange ) {
			my1stHeroPosition.x = my1stHero.damageTaken? my1stHero.position.x + (retreatDirection * retreatDistRangedHeroes) : furthestXmy1stHero + (retreatDirection * retreatDistRangedHeroes);
			my1stHeroPosition.y = my1stHero.position.y;
		} else {
			my1stHeroPosition.x = my1stHero.damageTaken? my1stHero.position.x + (retreatDirection * retreatDistMeleeHeroes) : furthestXmy1stHero + (retreatDirection * retreatDistMeleeHeroes);
			my1stHeroPosition.y = my1stHero.position.y;
		}
        
        var my2ndHeroPosition = new Position();
        if( my2ndHero.heroType === ironman || my2ndHero.heroType === drStrange ) {
            my2ndHeroPosition.x = my2ndHero.damageTaken? my2ndHero.position.x + (retreatDirection * retreatDistRangedHeroes) : furthestXmy2ndHero + (retreatDirection * retreatDistRangedHeroes);
            my2ndHeroPosition.y = my2ndHero.position.y;
        } else {
            my2ndHeroPosition.x = my2ndHero.damageTaken? my2ndHero.position.x + (retreatDirection * retreatDistMeleeHeroes) : furthestXmy2ndHero + (retreatDirection * retreatDistMeleeHeroes);
            my2ndHeroPosition.y = my2ndHero.position.y;
        }
        
        // Iterate through Foe Mobs to Find Various Targets
        var target1my1stHero = null;
        var target1my2ndHero = null;
        var target2my2ndHero = null;
        
        var targetLowestHealthmy1stHero = null;
        var targetLowestHealthmy2ndHero = null;
        
        foeMobs.forEach( function( mob, unitId)  {

            if( my1stHeroAlive ) {
                var my1stHeroDistToFoe = distance( my1stHeroPosition, mob.position );
                if ( my1stHeroDistToFoe <=  my1stHero.attackRange ) {
                    if( mob.health < my1stHero.attackDamage ) {
                        if( !target1my1stHero || target1my1stHero.health > mob.health ) {
                            target1my1stHero = mob;
                        }
                    }
                    
                    if ( !targetLowestHealthmy1stHero || targetLowestHealthmy1stHero.health > mob.health) {
                        targetLowestHealthmy1stHero = mob;
                    }
                } 
            }

            if( my2ndHeroAlive ) {
                var my2ndHeroDistToFoe = distance( my2ndHeroPosition, mob.position );                
                if ( my2ndHeroDistToFoe <=  my2ndHero.attackRange ) {
                    if( mob.health < my2ndHero.attackDamage ) {
                        if( !target1my2ndHero) {
                            target1my2ndHero = mob;
                        } else {
                            if( target1my2ndHero.health > mob.health ) {
                                target2my2ndHero = target1my2ndHero;
                                target1my2ndHero = mob;
                            } else {
                                if( !target2my2ndHero ) {
                                    target2my2ndHero = mob;       
                                } else {
                                    if( target2my2ndHero.health > mob.health ) {
                                        target2my2ndHero = mob;
                                    }      
                                }
                            }
                        }
                    }
                    
                    if ( !targetLowestHealthmy2ndHero || targetLowestHealthmy2ndHero.health > mob.health) {
                        targetLowestHealthmy2ndHero = mob;
                    }
                } 
            }
        });

        var my2ndHeroTarget = target1my2ndHero && (!target1my1stHero || target1my2ndHero.unitId != target1my1stHero.unitId) ? target1my2ndHero : target2my2ndHero; 
        var my1stHeroSellingItem = false;
		
        // **** Start Hero 1 Action Selection **** //		
        if( my1stHeroAlive ) {
            processHeroAction( my1stHero, my2ndHero, denyTarget1my1stHero, target1my1stHero, targetLowestHealthmy1stHero, my1stHeroPosition, my1stHeroItems, my1stHeroLowestCostItem, set1stHeroLowestCostItem )
        }
		
		// **** Start Hero 2 Action Selection **** //
		if( my2ndHeroAlive ) {
			processHeroAction( my2ndHero, my1stHero, my2ndHeroDenyTarget, my2ndHeroTarget, targetLowestHealthmy2ndHero, my2ndHeroPosition, my2ndHeroItems, my2ndHeroLowestCostItem, set2ndHeroLowestCostItem )
		}
        
        /**
        if( my2ndHeroAlive ) {
            // printErr("Hero2 ALIVE!");
            // Calculate in Range for Heroes vs Heroes
            var foe1stHeroInMy2ndHeroRange = foe1stHero.isVisible === 1 ? distance( my2ndHeroPosition, foe1stHero.position) <= my2ndHero.attackRange : false;
            var foe2ndHeroInMy2ndHeroRange = foe2ndHero.isVisible === 1 ? distance( my2ndHeroPosition, foe2ndHero.position) <= my2ndHero.attackRange : false;
            var foeHeroTargetMy2ndHero = foe1stHeroInMy2ndHeroRange && foe2ndHeroInMy2ndHeroRange ? (foe1stHero.health < foe2ndHero.health ? foe1stHero : foe2ndHero) : (foe1stHeroInMy2ndHeroRange ?  foe1stHero : ( foe2ndHeroInMy2ndHeroRange ? foe2ndHero : null));
            var enemyTowerInMy2ndHeroRange = distance( my2ndHeroPosition, foeTower.position) <= my2ndHero.attackRange;
            
            // Calculate if my Heroes Need Potions
            var my2ndHeroNeedsPotion =  (my2ndHero.health/ my2ndHero.maxHealth < healthPercentToGetPotions);
            
            var my2ndHeroItemAction = false;
    
            if( my2ndHeroNeedsPotion ) {
                var hpNeedingHealing = my2ndHero.maxHealth - my2ndHero.health;
                healingPotions.forEach( function(item) {
                    // printErr( "ItemCost: " + item.itemCost + " MY GOLD: " + currentGold);
                    if( item.itemCost < currentGold  && !my2ndHeroItemAction) { //&& item.health <= hpNeedingHealing
                        currentGold = currentGold - item.itemCost;
                        my2ndHeroItemAction = true;
                        my2ndHeroAction = "BUY " + item.itemName + "; Dr. needs MEDIC!";
                    }
                });
            } 
            
            var my2ndHeroItemList = null;
            if( my2ndHero.heroType === ironman) {
                if( dmgItems.length > 0 ) {
                    my2ndHeroItemList = dmgItems;
                } else {
                    my2ndHeroItemList = healthItems;
                }
            } else if ( my2ndHero.heroType === drStrange ) {
                if( manaRegenItems.length > 0 ) {
                    my2ndHeroItemList = manaRegenItems;
                } else {
                    my2ndHeroItemList = healthItems;
                }
            } else {
                if( dmgItems.length > 0 ) {
                    my2ndHeroItemList = dmgItems;
                } else {
                    my2ndHeroItemList = healthItems;
                }
            }
            
            if( my2ndHeroItemList.length > 0 && my2ndHero.itemsOwned < 3 ) { //&& currentGold > 500 ) {
                my2ndHeroItemList.forEach( function(item) {
                    if( item.itemCost < currentGold  && !my2ndHeroItemAction) { 
                        currentGold = currentGold - item.itemCost;
                        myCurrentItemWealth = myCurrentItemWealth + Math.floor(item.itemCost * 0.5 );
                        my2ndHeroItems.push(item);
                        
                        if( !my2ndHeroLowestCostItem || my2ndHeroLowestCostItem.itemCost > item.itemCost ) {
                            my2ndHeroLowestCostItem = item;
                        }
                        
                        my2ndHeroItemAction = true;
                        my2ndHeroAction = "BUY " + item.itemName + "; SHINY!";
                    }
                });
            } 
            else if( my2ndHeroItemList.length > 0  && !my1stHeroSellingItem)  {
                my2ndHeroItemList.forEach( function(item) {
                    if( item.itemCost < (currentGold +  Math.floor(my2ndHeroLowestCostItem.itemCost * 0.5)) && !my2ndHeroItemAction && item.itemCost > my2ndHeroLowestCostItem.itemCost ) { 
                        // printErr( "Item To Purchase Cost: " + item.itemCost + " LowestCostItem: " + my2ndHeroLowestCostItem.itemCost);
                        myCurrentItemWealth = myCurrentItemWealth - Math.floor(my2ndHeroLowestCostItem.itemCost * 0.5 );
                        
                        var foundItem = false;
                        var itemToSell = null;
                        var newEquipedItems = [];
                        var newLowestCostItem = null;
                        while ( my2ndHeroItems.length > 0 ) {
                            var tmpItem = my2ndHeroItems.shift();
                            
                            if( tmpItem.itemName === my2ndHeroLowestCostItem.itemName && !foundItem ) {
                                foundItem = true;
                                itemToSell = tmpItem;
                            } else {
                                newEquipedItems.push(tmpItem);   
                                if( !newLowestCostItem || newLowestCostItem.itemCost > tmpItem.itemCost ) {
                                    newLowestCostItem = tmpItem;
                                }
                            }
                        }
                        if( itemToSell ) {
                            my2ndHeroLowestCostItem = newLowestCostItem;
                            my2ndHeroItems = newEquipedItems;
    
                            my2ndHeroItemAction = true;
                            my2ndHeroAction = "SELL " + itemToSell.itemName + "; MONEY MONEY MONEY!";
                        }
                    }
                });
            }
            
            
            if( !my2ndHeroItemAction ) {
                
                var my2ndHeroUsingSkill = false;
                if( my2ndHero.heroType === ironman) {
                    if ( my2ndHero.mana > 50 && my2ndHero.countDown3 == 0 && !my2ndHero.damageTaken) {
                        if( my2ndHero.position.x === my2ndHeroPosition.x ) {
                            my2ndHeroUsingSkill = true;
                            if ( foeHeroTargetMy2ndHero ) { 
                                my2ndHeroAction = 'BURNING ' + foeHeroTargetMy2ndHero.position.x + ' ' + foeHeroTargetMy2ndHero.position.y;
                            } else if ( my2ndHeroTarget ) {
                                my2ndHeroAction = 'BURNING ' + my2ndHeroTarget.position.x + ' ' + my2ndHeroTarget.position.y;
                            } else if ( enemyTowerInMy1stHeroRange ) {
                                my2ndHeroAction = 'BURNING ' + foeTower.position.x + ' ' + foeTower.position.y;
                            } else {
                                my2ndHeroUsingSkill = false;
                            }
                        } 
                    } 
                } else if( my2ndHero.heroType === drStrange) {
                    
                    var my1stHeroInRangeOf2ndHeroHeals = distance( my2ndHero.position, my1stHero.position) <= 250;
                    var my1stHeroHealthLow = (my1stHero.health / my1stHero.maxHealth) < healthPercentToAOEHeal;
                    
                    if ( my2ndHero.mana > 150 && my2ndHero.countDown1 == 0 && !my2ndHero.damageTaken) {
                        if(my1stHeroHealthLow && my1stHeroInRangeOf2ndHeroHeals) {
                            my2ndHeroUsingSkill = true;
                            my2ndHeroAction = 'AOEHEAL ' + my1stHero.position.x + ' ' + my1stHero.position.y;
                        } else if( (my2ndHero.health / my2ndHero.maxHealth ) < healthPercentToAOEHeal ) {
                            my2ndHeroUsingSkill = true;
                            my2ndHeroAction = 'AOEHEAL ' + my2ndHero.position.x + ' ' + my2ndHero.position.y;
                        }
                    } 
                }
                
                if(!my2ndHeroUsingSkill) {
                    if( my2ndHeroDenyTarget ) {
                        my2ndHeroAction = 'MOVE_ATTACK ' + my2ndHeroPosition.x + ' ' + my2ndHeroPosition.y + ' ' + my2ndHeroDenyTarget.unitId;
                    } else  if ( my2ndHeroTarget ) {
                        my2ndHeroAction = 'MOVE_ATTACK ' + my2ndHeroPosition.x + ' ' + my2ndHeroPosition.y + ' ' + my2ndHeroTarget.unitId;
                    } else if ( foeHeroTargetMy2ndHero ) { 
                        my2ndHeroAction = 'MOVE_ATTACK ' + my2ndHeroPosition.x + ' ' + my2ndHeroPosition.y + ' ' + foeHeroTargetMy2ndHero.unitId;
                    } else if ( targetLowestHealthmy2ndHero ) {
                        my2ndHeroAction = 'MOVE_ATTACK ' + my2ndHeroPosition.x + ' ' + my2ndHeroPosition.y + ' ' + targetLowestHealthmy2ndHero.unitId;
                    } else if ( enemyTowerInMy2ndHeroRange ) {
                        my2ndHeroAction = 'MOVE_ATTACK ' + my2ndHeroPosition.x + ' ' + my2ndHeroPosition.y + ' ' + foeTower.unitId;
                    } else { 
                        // printErr("DEFAULT ACTION");
                        // TODO: SOMETHING ELSE!
                        my2ndHeroAction = 'MOVE ' + my2ndHeroPosition.x + ' ' + my2ndHeroPosition.y; // Return Home...
                    }
                }
                my2ndHeroAction = my2ndHeroAction + "; Dr. Dr.!";
                // my2ndHeroAction = "WAIT";
            }
            
            print(my2ndHeroAction);
        }*/
    }
    
    
    // printErr( "1st Hero Items: " + JSON.stringify(my1stHeroItems));
    // printErr( "Current Wealth: " + myCurrentItemWealth + " MyCurrentWealth: " + myCurrentWealth);
    // printErr( "1st Hero: " +JSON.stringify(my1stHero));
    // printErr( "2nd Hero: " + JSON.stringify(my2ndHero));
    // printErr( "My Tower: " + JSON.stringify(myTower));
    // printErr( "1st FOE HERO: " + JSON.stringify(foe1stHero));
    // printErr( "2nd FOE HERO: " + JSON.stringify(foe2ndHero));
    // printErr( "Foe Tower: " + JSON.stringify(foeTower));
}
