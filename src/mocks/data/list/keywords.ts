/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const KEYWORDS: string[] = [
  'énergie renouvelable',
  'panneaux solaires',
  'éolienne',
  'centrale hydroélectrique',
  'réseau intelligent',
  "stockage d'énergie",
  'efficacité énergétique',
  'smart grid',
  'véhicule électrique',
  'chargeur solaire',
  'batterie lithium-ion',
  'micro-réseau',
  'éclairage LED',
  "gestion de l'énergie",
  'système de contrôle',
  'automatisation',
  'maintenance prédictive',
  'réduction des émissions',
  'énergie solaire thermique',
  'réseau de distribution',
  "système de stockage d'énergie",
  'énergie géothermique',
  'énergie marémotrice',
  'réseau de charge',
  'énergie hybride',
  'énergie nucléaire',
  'réseau électrique intelligent',
  'énergie éolienne offshore',
  'énergie solaire photovoltaïque',
  'réseau de transport',
  'énergie biomasse',
  'énergie solaire concentrée',
  'réseau de microgrids',
  'passive',
  'portable',
  'résidentielle',
  'commerciale',
  'industrielle',
  'communautaire',
  'agricole',
  'flottante',
  'mobile',
  'hybride',
  'autonome',
  'décentralisée',
  'urbaine',
  'rurale',
  'éducative',
  'hospitalière',
  'gouvernementale',
  'militaire',
];

export const generateKeywords = (count: number, seed = 1): string[] =>
  Array.from({ length: count }, (_, idx) => KEYWORDS[Math.floor(idx * seed) % KEYWORDS.length]);

export default KEYWORDS;
