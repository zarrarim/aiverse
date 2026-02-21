# Steal a Brainrot: Military Bunker Mode

## Core Loop
- Every player owns a **multi-room bunker** used as a defensive base.
- Bunkers contain recruitable/capturable **NPC soldiers**.
- Players perform **raids** to steal high-value soldiers from enemy bunkers.
- Captured soldiers can be assigned to:
  - **Garde à vue (Defense mode)**: stays in home bunker, guards doors, patrols waypoints, and shoots intruders in a configured radius.
  - **Attaque (Attack mode)**: follows the player during raids, pushes into enemy bunkers, and disarms/captures enemy soldiers.

## Soldier Ownership & Team Logic (Script-Oriented)
Use both a hard ownership field and a runtime tag for flexibility.

### Recommended data on each soldier NPC
- `ownerUserId: number`
- `teamId: string`
- `roleMode: "GARDE" | "ATTAQUE"`
- `state: "IDLE" | "FOLLOW" | "PATROL" | "ENGAGE" | "CAPTURE" | "RETURN_TO_BASE" | "DETENTION"`
- `rank: "Common" | "Elite" | "Legendary"`
- `combatPower: number`

### Team changes on capture
When a soldier is captured:
1. Set `ownerUserId` to captor.
2. Update `teamId` (or Roblox `Team`) to captor team.
3. Apply status `DETENTION` temporarily (cannot instantly re-flip).
4. Issue navigation command to new owner bunker rally point.
5. Add anti-loop cooldown (`captureCooldownUntil`) to prevent rapid recapture abuse.

## AI States

### Defense mode (Garde à vue)
- **PATROL** between 2-5 waypoints.
- **DOOR_GUARD** behavior if assigned door exists:
  - Stay near door anchor.
  - Prioritize targets crossing access boundary.
- **ENGAGE** if hostile enters aggro radius.
- Return to assigned post after combat timeout.

### Attack mode (Attaque)
- **FOLLOW** owner with formation spacing.
- **BREACH** when entering enemy bunker zone.
- **ENGAGE** nearest hostile soldier or turret operator.
- **CAPTURE** instead of kill when target HP < threshold and stun/disarm succeeds.
- **RETURN_TO_BASE** automatically once capture objective is reached or owner exits raid zone.

## Bunker Architecture
Each bunker should include:
- Entry corridor with 1-2 lockable doors.
- Central operations room (camera feeds + turret control).
- Trap hall (mines, stun floor, gas burst).
- Soldier barracks and detention cells.
- **Safe room / coffre-fort** storing best soldiers (harder to breach, higher rewards).

## Security Systems
- **Lockable doors** with role-based access (`Owner`, `Allies`, `No one`).
- **Cameras** linked to alert pings (reveals intruders on minimap).
- **Turrets** with limited ammo, IFF by team.
- **Traps** with cooldown and maintenance cost.

## Capture Economy
Rewards are granted for:
- Successful soldier capture.
- Extracting captured soldier back to your bunker.
- Completing full raid objective (e.g., safe-room breach).

Currency sinks:
- Bunker upgrades (door tiers, turret levels, trap slots, camera range).
- Soldier upgrades (armor, weapon class, detection radius, capture efficiency).
- Utility unlocks (faster breach tools, jammer, EMP).

## Balance Rules (Anti-Snowball)
- Diminishing reward for repeatedly farming the same player.
- New/weak players get temporary bunker protection shield.
- Raid windows and bunker cooldown after a successful defense.
- Hard cap per rarity tier to avoid all-legendary armies early.

## Suggested Server Script Modules
- `SoldierStateMachine`
- `SoldierCaptureService`
- `BunkerSecurityService`
- `RaidSessionService`
- `EconomyService`
- `TeamOwnershipService`

## MVP Milestones
1. Single bunker + capture flow + team swap.
2. Defense/attack mode switching UI.
3. Patrol + follow + engage AI states.
4. One lockable door, one camera, one turret.
5. Currency rewards + 3 upgrade types.
