import { factionItemAligns } from 'app/destiny1/d1-factions';
import { D2ManifestDefinitions } from 'app/destiny2/d2-definitions';
import {
  D2Item,
  DimItem,
  DimMasterwork,
  DimSocket,
  PluggableInventoryItemDefinition,
} from 'app/inventory/item-types';
import { DimStore } from 'app/inventory/store-types';
import {
  armor2PlugCategoryHashes,
  CUSTOM_TOTAL_STAT_HASH,
  energyNamesByEnum,
  killTrackerObjectivesByHash,
  TOTAL_STAT_HASH,
} from 'app/search/d2-known-values';
import { damageNamesByEnum } from 'app/search/search-filter-values';
import { DestinyClass, DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2';
import powerCapToSeason from 'data/d2/lightcap-to-season.json';
import modSocketMetadata, { ModSocketMetadata } from 'data/d2/specialty-modslot-metadata';
import { objectifyArray } from './util';

// damage is a mess!
// this function supports turning a destiny DamageType or EnergyType into a known english name
// mainly for most css purposes and the filter names

export const getItemDamageShortName = (item: DimItem): string | undefined =>
  item.isDestiny2() && item.energy
    ? energyNamesByEnum[item.element?.enumValue ?? -1]
    : damageNamesByEnum[item.element?.enumValue ?? -1];

// these are helpers for identifying SpecialtySockets (seasonal mods).
// i would like this file to be the only one that interfaces with
// data/d2/specialty-modslot-metadata.json
// process its data here and export it to thing that needs it

const modMetadataBySocketTypeHash = objectifyArray(modSocketMetadata, 'socketTypeHash');

const modMetadataByPlugCategoryHash = objectifyArray(modSocketMetadata, 'plugCategoryHashes');

export const modMetadataByTag = objectifyArray(modSocketMetadata, 'tag');

/** i.e. ['outlaw', 'forge', 'opulent', etc] */
export const modSlotTags = modSocketMetadata.map((m) => m.tag);

// kind of silly but we are using a list of known mod hashes to identify specialty mod slots below
export const specialtySocketTypeHashes = modSocketMetadata.map(
  (modMetadata) => modMetadata.socketTypeHash
);

export const specialtyModPlugCategoryHashes = modSocketMetadata.flatMap(
  (modMetadata) => modMetadata.compatiblePlugCategoryHashes
);

export const emptySpecialtySocketHashes = modSocketMetadata.map(
  (modMetadata) => modMetadata.emptyModSocketHash
);

/** verifies an item is d2 armor and has a specialty mod slot, which is returned */
export const getSpecialtySocket = (item: DimItem): DimSocket | undefined => {
  if (item.isDestiny2() && item.bucket.inArmor) {
    return item.sockets?.allSockets.find((socket) =>
      specialtySocketTypeHashes.includes(socket.socketDefinition.socketTypeHash)
    );
  }
};

/** returns ModMetadata if the item has a specialty mod slot */
export const getSpecialtySocketMetadata = (item: DimItem): ModSocketMetadata | undefined =>
  modMetadataBySocketTypeHash[
    getSpecialtySocket(item)?.socketDefinition.socketTypeHash || -99999999
  ];

/**
 * returns ModMetadata if the plugCategoryHash (from a mod definition's .plug) is known
 *
 * if you use this you can only trust the returned season, tag, and emptyModSocketHash
 */
export const getSpecialtySocketMetadataByPlugCategoryHash = (
  plugCategoryHash: number
): ModSocketMetadata | undefined => modMetadataByPlugCategoryHash[plugCategoryHash];

/**
 * this always returns a string for easy printing purposes
 *
 * `''` if not found, so you can let it stay blank or `||` it
 */
export const getItemSpecialtyModSlotDisplayName = (
  item: DimItem,
  defs: D2ManifestDefinitions
): string => {
  const emptyModSocketHash = getSpecialtySocketMetadata(item)?.emptyModSocketHash;
  return (
    (emptyModSocketHash && defs.InventoryItem.get(emptyModSocketHash).itemTypeDisplayName) || ''
  );
};

/** feed a **mod** definition into this */
export const isArmor2Mod = (item: DestinyInventoryItemDefinition): boolean =>
  item.plug !== undefined &&
  (armor2PlugCategoryHashes.includes(item.plug.plugCategoryHash) ||
    specialtyModPlugCategoryHashes.includes(item.plug.plugCategoryHash));

/** given item, get the final season it will be relevant (able to hit max power level) */
export const getItemPowerCapFinalSeason = (item: DimItem): number | undefined =>
  item.isDestiny2() ? powerCapToSeason[item.powerCap ?? -99999999] : undefined;

/** accepts a DimMasterwork or lack thereof, & always returns a string */
export function getMasterworkStatNames(mw: DimMasterwork | null) {
  return (
    mw?.stats
      ?.map((stat) => stat.name)
      .filter(Boolean)
      .join(', ') ?? ''
  );
}

export function getPossiblyIncorrectStats(item: DimItem): string[] {
  const incorrect: Set<string> = new Set();
  const stats = item.stats;

  if (stats) {
    for (const stat of stats) {
      if (
        stat.statHash !== TOTAL_STAT_HASH &&
        stat.statHash !== CUSTOM_TOTAL_STAT_HASH &&
        stat.baseMayBeWrong &&
        stat.displayProperties.name
      ) {
        incorrect.add(stat.displayProperties.name);
      }
    }
  }
  return [...incorrect];
}

/**
 * "Instanced" items are uniquely identifiable by an id, while "uninstanced" items don't have any such
 * identifier even though there may be multiple of them in a given location.
 */
export function itemIsInstanced(item: DimItem): boolean {
  return item.id !== '0';
}

/** Can this item be equipped by the given store? */
export function itemCanBeEquippedBy(item: DimItem, store: DimStore): boolean {
  if (store.isVault) {
    return false;
  }

  return (
    item.equipment &&
    // For the right class
    (item.classType === DestinyClass.Unknown || item.classType === store.classType) &&
    // nothing we are too low-level to equip
    item.equipRequiredLevel <= store.level &&
    // can be moved or is already here
    (!item.notransfer || item.owner === store.id) &&
    !item.location.inPostmaster &&
    (item.isDestiny1() ? factionItemAligns(store, item) : true)
  );
}
/** Could this be added to a loadout? */
export function itemCanBeInLoadout(item: DimItem): boolean {
  return (
    item.equipment ||
    item.type === 'Consumables' ||
    // D1 had a "Material" type
    item.type === 'Material'
  );
}

/** verifies an item has kill tracker mod slot, which is returned */
const getKillTrackerSocket = (item: D2Item): DimSocket | undefined => {
  if (item.bucket.inWeapons) {
    return item.sockets?.allSockets.find(
      (socket) =>
        (socket.plugged?.plugObjectives[0]?.objectiveHash ?? 0) in killTrackerObjectivesByHash
    );
  }
};

export type KillTracker = {
  type: 'pve' | 'pvp';
  count: number;
  trackerDef: PluggableInventoryItemDefinition;
};

/** returns a socket's kill tracker info */
const getSocketKillTrackerInfo = (socket: DimSocket | undefined): KillTracker | undefined => {
  const installedKillTracker = socket?.plugged;
  if (installedKillTracker) {
    // getKillTrackerSocket's find() ensures that objectiveHash is in killTrackerObjectivesByHash
    const type = killTrackerObjectivesByHash[installedKillTracker.plugObjectives[0].objectiveHash];
    const count = installedKillTracker.plugObjectives[0]?.progress;
    if (type && count !== undefined) {
      return {
        type,
        count,
        trackerDef: installedKillTracker.plugDef,
      };
    }
  }
};

/** returns an item's kill tracker info */
export const getItemKillTrackerInfo = (item: D2Item): KillTracker | undefined =>
  getSocketKillTrackerInfo(getKillTrackerSocket(item));
