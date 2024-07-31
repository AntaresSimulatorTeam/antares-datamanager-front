/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export const generateKeywords = (count: number, seed = 1): string[] =>
  Array.from({ length: count }, (_, idx) => KEYWORDS[(idx * seed) % KEYWORDS.length]);

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
  'énergie solaire passive',
  'énergie solaire portable',
  'énergie solaire résidentielle',
  'énergie solaire commerciale',
  'énergie solaire industrielle',
  'énergie solaire communautaire',
  'énergie solaire agricole',
  'énergie solaire flottante',
  'énergie solaire mobile',
  'énergie solaire hybride',
  'énergie solaire autonome',
  'énergie solaire décentralisée',
  'énergie solaire urbaine',
  'énergie solaire rurale',
  'énergie solaire éducative',
  'énergie solaire hospitalière',
  'énergie solaire gouvernementale',
  'énergie solaire militaire',
];

export default KEYWORDS;
