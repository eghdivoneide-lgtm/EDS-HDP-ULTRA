// ═══════════════════════════════════════════════════════════════
// ANÁLISE 358 APOSTAS REAIS — Abr-Mai 2026
// Dados do Relatório oficial enviado pelo Comandante
// ═══════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

// Formato: [data, liga, mandante, visitante, mercado, periodo, selecao, odd, risco, status, lp]
// Status: G=GANHOU, P=PERDEU, R=REEMB
const APOSTAS = [
  // ═══ ALEMANHA - BUNDESLIGA (31) ═══
  ['02/05','BUN','Eintracht Frankfurt','Hamburger SV','HDP','FT','Eintracht Frankfurt -2',1.934,10,'G',9.34],
  ['02/05','BUN','Freiburg','Wolfsburg','HDP','FT','Freiburg -2',2.000,10,'P',-10],
  ['02/05','BUN','Freiburg','Wolfsburg','HDP','HT','Freiburg -1',2.010,10,'P',-10],
  ['02/05','BUN','St. Pauli','Mainz 05','HDP','FT','Mainz 05 0.0',2.020,10,'R',0],
  ['02/05','BUN','Union Berlin','FC Koln','HDP','FT','Union Berlin -1',1.925,10,'P',-10],
  ['02/05','BUN','Union Berlin','FC Koln','HDP','HT','Union Berlin -0.5',1.952,10,'P',-10],
  ['02/05','BUN','Werder Bremen','Augsburg','HDP','FT','Werder Bremen -1.5',1.800,10,'G',8.00],
  ['12/04','BUN','FC Koln','Werder Bremen','OU','FT','Mais de 10',2.090,10,'G',10.90],
  ['12/04','BUN','Mainz 05','Freiburg','OU','FT','Menos de 9.5',1.800,10,'P',-10],
  ['17/04','BUN','Eintracht Frankfurt','RB Leipzig','HDP','FT','RB Leipzig -0.5',1.943,10,'G',9.43],
  ['17/04','BUN','Eintracht Frankfurt','RB Leipzig','HDP','HT','RB Leipzig 0.0',1.714,10,'G',7.14],
  ['17/04','BUN','Hoffenheim','Borussia Dortmund','HDP','FT','Hoffenheim -0.5',1.934,10,'G',9.34],
  ['17/04','BUN','Hoffenheim','Borussia Dortmund','HDP','HT','Hoffenheim 0.0',1.775,10,'G',7.75],
  ['17/04','BUN','Union Berlin','Wolfsburg','HDP','FT','Union Berlin -2',1.961,10,'G',9.61],
  ['17/04','BUN','Union Berlin','Wolfsburg','HDP','HT','Union Berlin -1',1.980,10,'P',-10],
  ['17/04','BUN','Werder Bremen','Hamburger SV','HDP','FT','Werder Bremen -2',1.892,10,'G',8.92],
  ['17/04','BUN','Werder Bremen','Hamburger SV','HDP','HT','Werder Bremen -1',1.952,10,'G',9.52],
  ['18/04','BUN','Bayer Leverkusen','Augsburg','OU','FT','Menos de 10',1.943,10,'P',-10],
  ['18/04','BUN','Union Berlin','Wolfsburg','HDP','HT','Union Berlin -1',1.980,10,'P',-10],
  ['18/04','BUN','Werder Bremen','Hamburger SV','OU','FT','Menos de 9.5',1.862,10,'P',-10],
  ['24/04','BUN','Augsburg','Eintracht Frankfurt','HDP','FT','Eintracht Frankfurt 0.0',1.925,10,'P',-10],
  ['24/04','BUN','Augsburg','Eintracht Frankfurt','OU','FT','Menos de 9.5',2.030,10,'P',-10],
  ['24/04','BUN','FC Koln','Bayer Leverkusen','HDP','FT','Bayer Leverkusen -1',2.050,10,'G',10.50],
  ['24/04','BUN','Hamburger SV','Hoffenheim','HDP','FT','Hoffenheim -1',1.925,10,'G',9.25],
  ['24/04','BUN','Hamburger SV','Hoffenheim','HDP','HT','Hoffenheim -0.5',1.892,10,'G',8.92],
  ['24/04','BUN','Hamburger SV','Hoffenheim','OU','FT','Menos de 10',1.909,10,'P',-10],
  ['24/04','BUN','Heidenheim','St. Pauli','HDP','FT','Heidenheim -1',2.010,10,'P',-10],
  ['24/04','BUN','RB Leipzig','Union Berlin','HDP','HT','RB Leipzig -1.5',1.925,11,'G',10.18],
  ['24/04','BUN','RB Leipzig','Union Berlin','OU','FT','Mais de 10',2.000,10,'G',10.00],
  ['24/04','BUN','Wolfsburg','Borussia Mönchengladbach','OU','FT','Mais de 10',1.869,10,'G',8.69],
  ['25/04','BUN','Stuttgart','Werder Bremen','HDP','FT','Stuttgart -2',1.649,13.49,'G',8.76],

  // ═══ ARGENTINA - LIGA PRO (68) ═══
  ['02/05','ARG','Barracas Central','Banfield','OU','FT','Menos de 8.5',1.806,10,'G',8.06],
  ['02/05','ARG','Central Córdoba','Boca Juniors','OU','FT','Menos de 8.5',1.917,10,'G',9.17],
  ['02/05','ARG','Central Córdoba','Boca Juniors','OU','HT','Menos de 4',1.793,10,'G',7.93],
  ['02/05','ARG','Lanus','Deportivo Riestra','HDP','FT','Lanus -2',1.917,10,'P',-10],
  ['02/05','ARG','Lanus','Deportivo Riestra','OU','FT','Menos de 8.5',1.961,10,'P',-10],
  ['02/05','ARG','Lanus','Deportivo Riestra','OU','HT','Menos de 4',1.862,10,'G',8.62],
  ['02/05','ARG','Platense','Estudiantes de La Plata','HDP','FT','Platense -1',1.980,10,'G',9.80],
  ['02/05','ARG','Platense','Estudiantes de La Plata','HDP','FT','Platense -1',1.980,10,'G',9.80],
  ['02/05','ARG','Platense','Estudiantes de La Plata','OU','FT','Menos de 8.5',2.010,10,'P',-10],
  ['02/05','ARG','Platense','Estudiantes de La Plata','OU','HT','Menos de 4',1.884,10,'P',-10],
  ['02/05','ARG','Platense','Estudiantes de La Plata','OU','HT','Menos de 4',1.884,10,'P',-10],
  ['02/05','ARG','San Lorenzo','Independiente','HDP','FT','Independiente 0.0',1.925,10,'P',-10],
  ['02/05','ARG','San Lorenzo','Independiente','OU','FT','Menos de 8.5',1.961,10,'P',-10],
  ['02/05','ARG','Union de Santa Fe','Talleres de Cordoba','HDP','FT','Union de Santa Fe -2',1.943,10,'G',9.43],
  ['02/05','ARG','Union de Santa Fe','Talleres de Cordoba','HDP','HT','Union de Santa Fe -1',2.060,10,'G',10.60],
  ['03/05','ARG','Belgrano','Sarmiento de Junin','OU','FT','Menos de 9',1.917,10,'G',9.17],
  ['10/04','ARG','Belgrano','Aldosivi','HDP','FT','Belgrano -2',1.793,10,'P',-10],
  ['10/04','ARG','Belgrano','Aldosivi','HDP','HT','Belgrano -1',1.862,10,'P',-10],
  ['10/04','ARG','Belgrano','Aldosivi','OU','FT','Mais de 9',1.934,10,'P',-10],
  ['10/04','ARG','Belgrano','Aldosivi','OU','HT','Mais de 4',1.793,10,'R',0],
  ['10/04','ARG','Belgrano','Aldosivi','TT','FT','Belgrano Mais de 5.5',1.892,10,'P',-10],
  ['11/04','ARG','Estudiantes de La Plata','Union de Santa Fe','HDP','FT','Union de Santa Fe 0.0',2.010,10,'P',-10],
  ['11/04','ARG','Estudiantes de La Plata','Union de Santa Fe','OU','FT','Mais de 9',2.130,10,'G',11.30],
  ['11/04','ARG','Estudiantes de La Plata','Union de Santa Fe','OU','HT','Mais de 4',1.970,10,'P',-10],
  ['11/04','ARG','Independiente Rivadavia','Argentinos Juniors','HDP','FT','Argentinos Juniors -0.5',1.934,10,'P',-10],
  ['11/04','ARG','Independiente Rivadavia','Argentinos Juniors','HDP','HT','Argentinos Juniors -0.5',2.110,10,'P',-10],
  ['12/04','ARG','Newells Old Boys','San Lorenzo','HDP','FT','Newells Old Boys -0.5',1.934,12,'G',11.21],
  ['12/04','ARG','Newells Old Boys','San Lorenzo','OU','FT','Menos de 8.5',1.980,10,'G',9.80],
  ['12/04','ARG','Newells Old Boys','San Lorenzo','OU','HT','Menos de 4',1.847,10,'G',8.47],
  ['12/04','ARG','Platense','Gimnasia Mendoza','HDP','HT','Platense -1',2.090,10,'G',10.90],
  ['12/04','ARG','Platense','Gimnasia Mendoza','OU','HT','Menos de 4',1.847,10,'P',-10],
  ['13/04','ARG','Defensa Y Justicia','Talleres de Cordoba','HDP','FT','Defensa Y Justicia -0.5',1.990,11,'G',10.89],
  ['13/04','ARG','Lanus','Banfield','HDP','FT','Lanus -1.5',1.813,10,'G',8.13],
  ['13/04','ARG','Lanus','Banfield','HDP','HT','Lanus -1',2.060,10,'G',10.60],
  ['13/04','ARG','Lanus','Banfield','OU','FT','Menos de 9',1.869,11.89,'G',10.33],
  ['13/04','ARG','Sarmiento de Junin','Gimnasia La Plata','HDP','FT','Sarmiento de Junin -1',1.925,10,'P',-10],
  ['13/04','ARG','Sarmiento de Junin','Gimnasia La Plata','HDP','HT','Sarmiento de Junin -0.5',1.952,10,'P',-10],
  ['17/04','ARG','Gimnasia La Plata','Estudiantes Rio Cuarto','HDP','FT','Estudiantes Rio Cuarto 0.0',2.490,10,'G',14.90],
  ['17/04','ARG','Instituto','Estudiantes de La Plata','OU','FT','Menos de 9',1.980,10,'R',0],
  ['17/04','ARG','Union de Santa Fe','Newells Old Boys','HDP','FT','Union de Santa Fe -2.5',1.917,10,'G',9.17],
  ['17/04','ARG','Union de Santa Fe','Newells Old Boys','HDP','HT','Union de Santa Fe -1',1.699,15,'G',10.49],
  ['18/04','ARG','Argentinos Juniors','Atlético Tucumán','OU','FT','Menos de 9',1.813,10,'R',0],
  ['18/04','ARG','Argentinos Juniors','Atlético Tucumán','OU','HT','Menos de 4',1.917,10,'P',-10],
  ['18/04','ARG','Instituto','Estudiantes de La Plata','OU','FT','Menos de 9',1.980,10,'R',0],
  ['18/04','ARG','River Plate','Boca Juniors','HDP','FT','River Plate -2',2.140,10,'G',11.40],
  ['18/04','ARG','Rosario Central','Sarmiento de Junin','OU','FT','Menos de 9',1.909,10,'G',9.09],
  ['18/04','ARG','Rosario Central','Sarmiento de Junin','OU','HT','Menos de 4',1.970,10,'G',9.70],
  ['18/04','ARG','San Lorenzo','Vélez Sarsfield','OU','HT','Menos de 4',1.719,10,'R',0],
  ['18/04','ARG','Talleres de Cordoba','Deportivo Riestra','OU','FT','Menos de 9',1.884,10,'P',-10],
  ['20/04','ARG','Banfield','Independiente Rivadavia','OU','FT','Menos de 9',1.826,12.17,'R',0],
  ['20/04','ARG','Barracas Central','Belgrano','OU','FT','Menos de 8',1.854,12,'G',10.25],
  ['24/04','ARG','Deportivo Riestra','Independiente','HDP','HT','Deportivo Riestra 0.0',2.140,10,'R',0],
  ['24/04','ARG','Deportivo Riestra','Independiente','OU','FT','Mais de 9',2.100,10,'P',-10],
  ['24/04','ARG','Estudiantes Rio Cuarto','Rosario Central','HDP','FT','Estudiantes Rio Cuarto 0.0',2.110,10,'P',-10],
  ['24/04','ARG','Lanus','Central Córdoba','HDP','HT','Lanus -1.5',2.020,7.30,'P',-7.30],
  ['24/04','ARG','Lanus','Central Córdoba','OU','FT','Menos de 8.5',1.980,10,'G',9.80],
  ['24/04','ARG','Platense','San Lorenzo','OU','FT','Menos de 8',1.952,10,'P',-10],
  ['24/04','ARG','Platense','San Lorenzo','OU','HT','Menos de 4',1.641,10,'P',-10],
  ['24/04','ARG','Racing Club','Barracas Central','OU','FT','Menos de 8.5',1.854,10,'G',8.54],
  ['24/04','ARG','Racing Club','Barracas Central','OU','HT','Menos de 4',1.877,10,'G',8.77],
  ['25/04','ARG','Estudiantes de La Plata','Talleres de Cordoba','OU','FT','Menos de 9.5',1.751,10,'G',7.51],
  ['25/04','ARG','River Plate','Aldosivi','OU','FT','Menos de 9.5',1.826,10,'G',8.26],
  ['25/04','ARG','Sarmiento de Junin','CA Tigre','OU','FT','Menos de 9',1.869,10,'R',0],
  ['26/04','ARG','Atlético Tucumán','Banfield','HDP','FT','Atlético Tucumán -2',2.080,10,'P',-10],
  ['26/04','ARG','Belgrano','Gimnasia La Plata','OU','FT','Menos de 9',2.010,10,'R',0],
  ['26/04','ARG','Independiente Rivadavia','Gimnasia Mendoza','HDP','FT','Independiente Rivadavia -1.5',1.833,10,'G',8.33],
  ['26/04','ARG','Independiente Rivadavia','Gimnasia Mendoza','OU','FT','Menos de 8.5',1.840,5,'P',-5],
  ['26/04','ARG','Newells Old Boys','Instituto','HDP','FT','Instituto -0.5',1.990,10,'P',-10],

  // ═══ ARGENTINA - PRIMEIRA B (64) ═══
  ['02/05','ARG_B','Estudiantes de Caseros','San Telmo','OU','FT','Menos de 8',2.050,10,'P',-10],
  ['02/05','ARG_B','Estudiantes de Caseros','San Telmo','OU','HT','Menos de 4',1.769,10,'R',0],
  ['02/05','ARG_B','Los Andes','Colón de Santa Fe','OU','FT','Menos de 8.5',1.869,10,'G',8.69],
  ['02/05','ARG_B','Los Andes','Colón de Santa Fe','OU','HT','Menos de 4',1.800,10,'G',8.00],
  ['02/05','ARG_B','San Martin de Tucuman','Atletico Rafaela','OU','FT','Menos de 8.5',1.961,10,'G',9.61],
  ['02/05','ARG_B','San Martin de Tucuman','Atletico Rafaela','OU','HT','Menos de 4',1.869,10,'R',0],
  ['03/05','ARG_B','Almirante Brown','Chaco For Ever','HDP','FT','Chaco For Ever 0.0',2.370,10,'G',13.70],
  ['03/05','ARG_B','CA Atlanta','Tristán Suárez','HDP','FT','CA Atlanta -1.5',1.943,10,'P',-10],
  ['03/05','ARG_B','Gimnasia Jujuy','Deportivo Maipu','HDP','FT','Deportivo Maipu +0.5',2.400,10,'P',-10],
  ['13/04','ARG_B','Nueva Chicago','Ferrocarril Midland','HDP','FT','Ferrocarril Midland 0.0',2.290,10,'G',12.90],
  ['13/04','ARG_B','Nueva Chicago','Ferrocarril Midland','OU','FT','Menos de 8.5',1.854,10,'G',8.54],
  ['13/04','ARG_B','Nueva Chicago','Ferrocarril Midland','OU','FT','Mais de 9',2.150,10,'P',-10],
  ['13/04','ARG_B','San Martin de San Juan','CA Atlanta','OU','FT','Menos de 8',1.943,10,'P',-10],
  ['13/04','ARG_B','Tristán Suárez','Atletico Rafaela','HDP','FT','Tristán Suárez -2',2.090,10,'G',10.90],
  ['17/04','ARG_B','All Boys','Acassuso','HDP','HT','All Boys -1',1.833,10,'G',8.33],
  ['17/04','ARG_B','Deportivo Moron','Colón de Santa Fe','HDP','HT','Deportivo Moron -0.5',1.806,10,'G',8.06],
  ['17/04','ARG_B','Ferrocarril Midland','San Martin de San Juan','HDP','FT','Ferrocarril Midland -1',1.943,10,'G',9.43],
  ['17/04','ARG_B','Los Andes','San Telmo','HDP','HT','Los Andes -1',2.090,10,'R',0],
  ['18/04','ARG_B','Ferrocarril Midland','San Martin de San Juan','OU','HT','Menos de 4',1.740,10,'G',7.40],
  ['18/04','ARG_B','Gimnasia Jujuy','Club Almagro','HDP','FT','Gimnasia Jujuy -2',1.892,10,'P',-10],
  ['18/04','ARG_B','Gimnasia Jujuy','Club Almagro','HDP','HT','Gimnasia Jujuy -1',1.917,10,'R',0],
  ['18/04','ARG_B','Gimnasia y Tiro','Guemes','HDP','FT','Gimnasia y Tiro -2',1.980,10,'G',9.80],
  ['18/04','ARG_B','Gimnasia y Tiro','Guemes','HDP','HT','Gimnasia y Tiro -1',2.000,10,'G',10.00],
  ['18/04','ARG_B','Los Andes','San Telmo','OU','FT','Menos de 9',1.763,10,'G',7.63],
  ['18/04','ARG_B','Patronato','Deportivo Maipu','HDP','FT','Deportivo Maipu +1',1.869,10,'G',8.69],
  ['18/04','ARG_B','Patronato','Deportivo Maipu','OU','FT','Mais de 8.5',1.740,10,'G',7.40],
  ['18/04','ARG_B','Racing de Cordoba','Defensores de Belgrano','HDP','FT','Racing de Cordoba -1.5',1.925,10,'G',9.25],
  ['18/04','ARG_B','Racing de Cordoba','Defensores de Belgrano','HDP','HT','Racing de Cordoba -1',2.170,10,'P',-10],
  ['25/04','ARG_B','San Miguel','Los Andes','HDP','FT','San Miguel -2',1.990,10,'G',9.90],
  ['25/04','ARG_B','San Miguel','Los Andes','OU','FT','Menos de 8.5',1.689,10,'P',-10],
  ['25/04','ARG_B','San Telmo','All Boys','OU','FT','Menos de 8.5',1.892,10,'G',8.92],
  ['25/04','ARG_B','San Telmo','All Boys','OU','HT','Menos de 4',1.819,10,'G',8.19],
  ['26/04','ARG_B','Acassuso','Estudiantes de Caseros','OU','FT','Menos de 8.5',1.751,10,'P',-10],
  ['26/04','ARG_B','Acassuso','Estudiantes de Caseros','OU','FT','Menos de 8.5',1.751,12,'P',-12],
  ['26/04','ARG_B','Acassuso','Estudiantes de Caseros','OU','HT','Menos de 4',1.714,10,'R',0],
  ['26/04','ARG_B','Acassuso','Estudiantes de Caseros','OU','HT','Menos de 4',1.714,10,'R',0],
  ['26/04','ARG_B','Agropecuario','San Martin de Tucuman','HDP','FT','Agropecuario -1',1.990,10,'P',-10],
  ['26/04','ARG_B','Agropecuario','San Martin de Tucuman','OU','FT','Menos de 9',1.806,10,'G',8.06],
  ['26/04','ARG_B','Agropecuario','San Martin de Tucuman','OU','FT','Menos de 9',1.806,10,'G',8.06],
  ['26/04','ARG_B','Agropecuario','San Martin de Tucuman','OU','HT','Menos de 4',1.917,10,'G',9.17],
  ['26/04','ARG_B','Agropecuario','San Martin de Tucuman','OU','HT','Menos de 4',1.917,10,'G',9.17],
  ['26/04','ARG_B','Central Norte Salta','Club Ciudad de Bolivar','HDP','FT','Central Norte Salta -1.5',1.877,10,'G',8.77],
  ['26/04','ARG_B','Central Norte Salta','Club Ciudad de Bolivar','OU','FT','Menos de 8.5',1.884,10,'G',8.84],
  ['26/04','ARG_B','Central Norte Salta','Club Ciudad de Bolivar','OU','FT','Menos de 8.5',1.884,10,'G',8.84],
  ['26/04','ARG_B','Chaco For Ever','Club Atletico Mitre','OU','FT','Menos de 8',1.925,10,'P',-10],
  ['26/04','ARG_B','Chaco For Ever','Club Atletico Mitre','OU','FT','Menos de 8',1.925,10,'P',-10],
  ['26/04','ARG_B','Chaco For Ever','Club Atletico Mitre','OU','HT','Menos de 3.5',1.970,10,'P',-10],
  ['26/04','ARG_B','Colón de Santa Fe','Godoy Cruz','OU','FT','Menos de 9',1.775,10,'G',7.75],
  ['26/04','ARG_B','Deportivo Madryn','Defensores de Belgrano','OU','FT','Menos de 8.5',1.840,10,'G',8.40],
  ['26/04','ARG_B','Deportivo Madryn','Defensores de Belgrano','OU','FT','Menos de 8.5',1.840,10,'G',8.40],
  ['26/04','ARG_B','Deportivo Madryn','Defensores de Belgrano','OU','HT','Menos de 4',1.806,10,'G',8.06],
  ['26/04','ARG_B','Deportivo Madryn','Defensores de Belgrano','OU','HT','Menos de 4',1.806,10,'G',8.06],
  ['26/04','ARG_B','Deportivo Moron','Racing de Cordoba','HDP','FT','Deportivo Moron -2.5',1.877,10,'G',8.77],
  ['26/04','ARG_B','Deportivo Moron','Racing de Cordoba','OU','FT','Menos de 8.5',1.775,12,'G',9.30],
  ['26/04','ARG_B','Guemes','CA Atlanta','HDP','FT','Guemes -1',1.980,10,'G',9.80],
  ['26/04','ARG_B','Nueva Chicago','Colegiales','HDP','FT','Colegiales 0.0',2.270,10,'G',12.70],
  ['26/04','ARG_B','Nueva Chicago','Colegiales','OU','FT','Menos de 8.5',1.970,10,'G',9.70],
  ['26/04','ARG_B','Tristán Suárez','Gimnasia y Tiro','OU','FT','Menos de 8.5',1.813,10,'P',-10],
  ['26/04','ARG_B','Tristán Suárez','Gimnasia y Tiro','OU','FT','Menos de 8.5',1.806,10,'P',-10],
  ['26/04','ARG_B','Tristán Suárez','Gimnasia y Tiro','OU','HT','Menos de 4',1.763,10,'P',-10],
  ['28/04','ARG_B','Ferro Carril Oeste','Almirante Brown','HDP','FT','Ferro Carril Oeste -2',2.010,10,'G',10.10],
  ['28/04','ARG_B','Ferro Carril Oeste','Almirante Brown','HDP','HT','Ferro Carril Oeste -1',2.030,10,'G',10.30],
  ['30/04','ARG_B','All Boys','San Miguel','HDP','FT','All Boys -1',1.877,11.42,'G',10.02],
  ['30/04','ARG_B','All Boys','San Miguel','HDP','HT','All Boys -0.5',1.925,10,'G',9.25],

  // ═══ AUSTRÁLIA - A-LEAGUE (20) ═══
  ['01/05','ALM','Auckland FC','Melbourne City','HDP','FT','Auckland FC -1',2.070,10,'P',-10],
  ['01/05','ALM','Auckland FC','Melbourne City','HDP','HT','Auckland FC -0.5',2.010,10,'P',-10],
  ['01/05','ALM','Melbourne Victory','Sydney FC','HDP','FT','Melbourne Victory -1.5',1.925,10,'G',9.25],
  ['01/05','ALM','Melbourne Victory','Sydney FC','HDP','HT','Melbourne Victory -0.5',1.826,10,'P',-10],
  ['16/04','ALM','Melbourne Victory','Newcastle Jets','HDP','FT','Melbourne Victory -2',2.070,13,'G',13.91],
  ['16/04','ALM','Melbourne Victory','Newcastle Jets','HDP','HT','Melbourne Victory -1',2.100,10,'G',11.00],
  ['16/04','ALM','Melbourne Victory','Newcastle Jets','OU','FT','Mais de 11',1.990,10.29,'P',-10.29],
  ['16/04','ALM','Melbourne Victory','Newcastle Jets','OU','HT','Mais de 5',1.840,10,'P',-10],
  ['17/04','ALM','Adelaide United','Macarthur FC','HDP','FT','Adelaide United -1',1.900,10,'G',9.00],
  ['17/04','ALM','Adelaide United','Macarthur FC','HDP','HT','Adelaide United -0.5',1.952,10,'G',9.52],
  ['17/04','ALM','Auckland FC','Central Coast Mariners','HDP','FT','Auckland FC -2.5',1.806,10.40,'G',8.38],
  ['17/04','ALM','Auckland FC','Central Coast Mariners','HDP','HT','Auckland FC -1.5',2.000,10,'G',10.00],
  ['17/04','ALM','Sydney FC','Perth Glory','HDP','FT','Sydney FC -2',1.833,10,'G',8.33],
  ['17/04','ALM','Wellington Phoenix','Western Sydney Wanderers','HDP','FT','Western Sydney Wanderers 0.0',2.150,10,'P',-10],
  ['17/04','ALM','Wellington Phoenix','Western Sydney Wanderers','HDP','HT','Western Sydney Wanderers 0.0',2.130,10,'P',-10],
  ['24/04','ALM','Newcastle Jets','Central Coast Mariners','HDP','HT','Newcastle Jets -1',1.884,10,'P',-10],
  ['24/04','ALM','Newcastle Jets','Central Coast Mariners','OU','FT','Menos de 10',1.943,10,'G',9.43],
  ['24/04','ALM','Perth Glory','Brisbane Roar','HDP','FT','Brisbane Roar -0.5',1.943,10,'G',9.43],
  ['25/04','ALM','Melbourne City','Adelaide United','HDP','FT','Adelaide United +0.5',2.200,10,'G',12.00],
  ['25/04','ALM','Sydney FC','Auckland FC','OU','FT','Menos de 10',1.970,11,'R',0],

  // ═══ BRASIL - SÉRIE A (26) ═══
  ['02/05','BR','Athletico Paranaense','Gremio','HDP','FT','Athletico Paranaense -2',1.909,10,'G',9.09],
  ['02/05','BR','Athletico Paranaense','Gremio','OU','FT','Menos de 9.5',1.917,10,'P',-10],
  ['02/05','BR','Athletico Paranaense','Gremio','OU','HT','Menos de 4.5',1.862,10,'P',-10],
  ['02/05','BR','Botafogo FR RJ','Remo','OU','FT','Menos de 10',1.877,10,'P',-10],
  ['02/05','BR','Botafogo FR RJ','Remo','OU','HT','Menos de 4.5',1.934,10,'P',-10],
  ['02/05','BR','Vitoria','Coritiba','HDP','FT','Vitoria -1.5',1.800,10,'P',-10],
  ['05/04','BR','Bahia','Palmeiras','HDP','HT','Bahia -0.5',1.970,13.65,'G',13.24],
  ['11/04','BR','Internacional','Gremio','HDP','FT','Internacional -0.5',1.806,14.99,'G',12.08],
  ['11/04','BR','Mirassol','Bahia','OU','FT','Mais de 8.5',2.040,10,'G',10.40],
  ['12/04','BR','Corinthians','Palmeiras','HDP','FT','Corinthians -0.5',2.090,10,'P',-10],
  ['12/04','BR','Cruzeiro','Bragantino','HDP','FT','Cruzeiro -0.5',2.720,13.33,'P',-13.33],
  ['12/04','BR','Cruzeiro','Bragantino','HDP','HT','Cruzeiro -1',1.862,13.33,'R',0],
  ['17/04','BR','Chapecoense','Botafogo FR RJ','HDP','FT','Chapecoense -0.5',1.952,10,'P',-10],
  ['17/04','BR','Chapecoense','Botafogo FR RJ','HDP','HT','Chapecoense 0.0',1.800,10,'R',0],
  ['17/04','BR','Vitoria','Corinthians','HDP','FT','Corinthians -0.5',2.150,10,'P',-10],
  ['18/04','BR','Cruzeiro','Gremio','OU','FT','Menos de 9.5',2.060,10,'G',10.60],
  ['18/04','BR','Cruzeiro','Gremio','OU','HT','Menos de 4.5',1.909,10,'G',9.09],
  ['18/04','BR','Vasco da Gama','São Paulo','OU','HT','Menos de 4.5',1.819,10,'P',-10],
  ['18/04','BR','Vitoria','Corinthians','OU','FT','Menos de 9.5',1.980,10,'G',9.80],
  ['18/04','BR','Vitoria','Corinthians','OU','HT','Menos de 4.5',1.869,10,'G',8.69],
  ['25/04','BR','Botafogo FR RJ','Internacional','HDP','FT','Internacional 0.0',1.970,10,'G',9.70],
  ['25/04','BR','Botafogo FR RJ','Internacional','OU','FT','Mais de 10',2.010,10,'P',-10],
  ['25/04','BR','Remo','Cruzeiro','HDP','FT','Cruzeiro -1',2.040,10,'P',-10],
  ['25/04','BR','Remo','Cruzeiro','HDP','HT','Cruzeiro -0.5',1.961,10,'P',-10],
  ['26/04','BR','Corinthians','Vasco da Gama','HDP','FT','Vasco da Gama +1.5',1.952,10,'G',9.52],
  ['26/04','BR','Gremio','Coritiba','HDP','FT','Gremio -1',1.934,11,'G',10.27],

  // ═══ BRASIL - SÉRIE B (5) ═══
  ['02/05','BR_B','Botafogo SP','Nautico','HDP','FT','Botafogo SP -0.5',1.847,10,'G',8.47],
  ['02/05','BR_B','Cuiabá','Criciuma','OU','FT','Menos de 9.5',1.917,10,'G',9.17],
  ['02/05','BR_B','Cuiabá','Criciuma','OU','HT','Menos de 4.5',1.793,10,'G',7.93],
  ['02/05','BR_B','Fortaleza','Goiás','OU','FT','Menos de 9.5',1.869,10,'G',8.69],
  ['02/05','BR_B','Fortaleza','Goiás','OU','HT','Menos de 4.5',1.775,10,'G',7.75],

  // ═══ CHILE (9) ═══
  ['13/04','CHI','Union La Calera','Deportes Concepcion','HDP','FT','Union La Calera -1',2.100,10,'P',-10],
  ['13/04','CHI','Union La Calera','Deportes Concepcion','OU','FT','Menos de 9',1.943,10,'P',-10],
  ['17/04','CHI','Deportes Concepcion','Deportes La Serena','HDP','FT','Deportes Concepcion -1',1.909,10,'P',-10],
  ['17/04','CHI','Deportes Limache','Universidad de Concepción','HDP','FT','Universidad de Concepción +0.5',2.040,10,'G',10.40],
  ['17/04','CHI','Deportes Limache','Universidad de Concepción','HDP','HT','Universidad de Concepción 0.0',2.260,10,'G',12.60],
  ['17/04','CHI','Everton Vina del Mar','Universidad de Chile','HDP','FT','Everton Vina del Mar 0.0',2.240,10,'P',-10],
  ['24/04','CHI','Audax Italiano','Deportes Limache','OU','FT','Menos de 9',2.010,10,'G',10.10],
  ['24/04','CHI','Audax Italiano','Deportes Limache','OU','HT','Menos de 4',2.010,10,'G',10.10],
  ['24/04','CHI','Union La Calera','Coquimbo Unido','OU','FT','Mais de 10',1.990,10,'P',-10],

  // ═══ CHINA - LEAGUE ONE (3) ═══
  ['01/05','CHN_1','Dalian K\'un City','Foshan Nanshi','HDP','FT','Dalian K\'un City -2',2.100,10,'G',11.00],
  ['02/05','CHN_1','Dingnan United','Shaanxi Union','HDP','FT','Dingnan United 0.0',1.943,10,'G',9.43],
  ['02/05','CHN_1','Yanbian Longding','Wuxi Wugou','HDP','FT','Wuxi Wugou 0.0',2.120,10,'P',-10],

  // ═══ CHINA - SUPERLIGA (7) ═══
  ['01/05','CHN_S','Zhejiang','Shenzhen Peng City','HDP','FT','Zhejiang -2.5',1.934,10,'P',-10],
  ['01/05','CHN_S','Zhejiang','Shenzhen Peng City','HDP','HT','Zhejiang -1',1.740,13.45,'P',-13.45],
  ['02/05','CHN_S','Yunnan Yukun','Beijing Guoan','HDP','FT','Yunnan Yukun 0.0',1.980,10,'P',-10],
  ['30/04','CHN_S','Dalian Yingbo','Chongqing Tonglianglong','HDP','FT','Dalian Yingbo -1.5',1.970,10,'G',9.70],
  ['30/04','CHN_S','Dalian Yingbo','Chongqing Tonglianglong','HDP','HT','Dalian Yingbo -0.5',1.862,9.25,'G',7.97],
  ['30/04','CHN_S','Shandong Taishan','Qingdao West Coast','HDP','FT','Shandong Taishan -2.5',1.884,10,'P',-10],
  ['30/04','CHN_S','Tianjin Jinmen Tiger','Wuhan Three Towns','HDP','FT','Tianjin Jinmen Tiger -0.5',1.909,10,'G',9.09],

  // ═══ MLS (58) ═══
  ['02/05','MLS','Houston Dynamo','Colorado Rapids','HDP','FT','Houston Dynamo -1.5',1.909,10,'P',-10],
  ['02/05','MLS','Inter Miami','Orlando City','HDP','FT','Inter Miami -3',1.806,10,'G',8.06],
  ['02/05','MLS','Philadelphia Union','Nashville SC','HDP','FT','Philadelphia Union -1',1.869,10,'G',8.69],
  ['02/05','MLS','Real Salt Lake','Portland Timbers','HDP','FT','Real Salt Lake -2',1.833,12,'G',10.00],
  ['04/04','MLS','Real Salt Lake','Sporting Kansas City','HDP','HT','Real Salt Lake -1',1.671,20,'G',13.42],
  ['04/04','MLS','Real Salt Lake','Sporting Kansas City','OU','FT','Mais de 10',1.900,20,'P',-20],
  ['04/04','MLS','Real Salt Lake','Sporting Kansas City','OU','HT','Mais de 4.5',1.806,20,'P',-20],
  ['11/04','MLS','Austin FC','Los Angeles Galaxy','HDP','FT','Los Angeles Galaxy +0.5',1.925,10,'G',9.25],
  ['11/04','MLS','Austin FC','Los Angeles Galaxy','HDP','FT','Los Angeles Galaxy -0.5',2.090,10,'P',-10],
  ['11/04','MLS','Austin FC','Los Angeles Galaxy','HDP','HT','Los Angeles Galaxy 0.0',1.869,10,'P',-10],
  ['11/04','MLS','Austin FC','Los Angeles Galaxy','OU','FT','Mais de 9',2.240,10,'G',12.40],
  ['11/04','MLS','Austin FC','Los Angeles Galaxy','OU','HT','Mais de 3.5',1.990,10,'G',9.90],
  ['11/04','MLS','CF Montreal','Philadelphia Union','HDP','FT','Philadelphia Union -0.5',1.980,10,'G',9.80],
  ['11/04','MLS','CF Montreal','Philadelphia Union','HDP','HT','Philadelphia Union -0.5',2.280,10,'P',-10],
  ['11/04','MLS','CF Montreal','Philadelphia Union','OU','FT','Mais de 7.5',2.080,10,'P',-10],
  ['11/04','MLS','CF Montreal','Philadelphia Union','OU','HT','Mais de 2.5',2.030,10,'P',-10],
  ['11/04','MLS','Portland Timbers','Los Angeles FC','OU','FT','Mais de 6.5',1.877,21,'G',18.42],
  ['11/04','MLS','Toronto FC','FC Cincinnati','HDP','FT','FC Cincinnati 0.0',1.943,10.51,'P',-10.51],
  ['11/04','MLS','Toronto FC','FC Cincinnati','OU','FT','Mais de 10',1.900,15,'G',13.50],
  ['12/04','MLS','Columbus Crew','Orlando City','HDP','HT','Columbus Crew -0.5',1.840,10,'P',-10],
  ['12/04','MLS','Columbus Crew','Orlando City','HDP','HT','Columbus Crew -2',2.100,10,'G',11.00],
  ['17/04','MLS','CF Montreal','New York Red Bulls','HDP','FT','New York Red Bulls 0.0',2.000,10,'G',10.00],
  ['17/04','MLS','CF Montreal','New York Red Bulls','HDP','HT','New York Red Bulls 0.0',1.961,10,'G',9.61],
  ['17/04','MLS','Colorado Rapids','Inter Miami','HDP','FT','Inter Miami -1',2.060,10,'P',-10],
  ['17/04','MLS','Colorado Rapids','Inter Miami','HDP','HT','Inter Miami -0.5',2.000,10,'P',-10],
  ['17/04','MLS','Toronto FC','Austin FC','HDP','FT','Toronto FC -2',2.040,10,'P',-10],
  ['17/04','MLS','Toronto FC','Austin FC','HDP','HT','Toronto FC -1',2.060,10,'P',-10],
  ['18/04','MLS','Atlanta United','Nashville SC','OU','FT','Menos de 9',2.000,10,'P',-10],
  ['18/04','MLS','Minnesota United','Portland Timbers','OU','FT','Mais de 10.5',1.980,10,'P',-10],
  ['18/04','MLS','New York City','Charlotte FC','OU','FT','Menos de 9.5',1.961,10,'G',9.61],
  ['18/04','MLS','New York City','Charlotte FC','OU','HT','Menos de 4.5',1.862,10,'G',8.62],
  ['18/04','MLS','Orlando City','Houston Dynamo','OU','FT','Mais de 10',1.840,10,'P',-10],
  ['18/04','MLS','Toronto FC','Austin FC','OU','FT','Mais de 10',2.020,10,'G',10.20],
  ['22/04','MLS','Atlanta United','New England Revolution','OU','FT','Menos de 9.5',1.990,10,'P',-10],
  ['22/04','MLS','Columbus Crew','Los Angeles Galaxy','HDP','HT','Columbus Crew -1',1.900,10,'G',9.00],
  ['22/04','MLS','Los Angeles FC','Colorado Rapids','HDP','HT','Los Angeles FC -1',1.800,10,'P',-10],
  ['22/04','MLS','New York City','FC Cincinnati','OU','FT','Menos de 10',1.925,10,'G',9.25],
  ['22/04','MLS','New York Red Bulls','D.C. United','HDP','HT','New York Red Bulls -1',1.892,10,'P',-10],
  ['22/04','MLS','Orlando City','Charlotte FC','OU','FT','Menos de 9',1.653,10.72,'G',7.00],
  ['22/04','MLS','San Jose Earthquakes','Austin FC','HDP','HT','San Jose Earthquakes -1.5',1.961,10,'G',9.61],
  ['22/04','MLS','San Jose Earthquakes','Austin FC','HDP','HT','San Jose Earthquakes -1',1.657,13,'G',8.54],
  ['22/04','MLS','Toronto FC','Philadelphia Union','HDP','FT','Philadelphia Union -0.5',2.040,10,'P',-10],
  ['25/04','MLS','Austin FC','Houston Dynamo','HDP','FT','Houston Dynamo 0.0',1.990,10,'G',9.90],
  ['25/04','MLS','CF Montreal','New York City','OU','FT','Menos de 9.5',1.970,10,'G',9.70],
  ['25/04','MLS','CF Montreal','New York City','OU','HT','Menos de 4.5',1.793,10,'G',7.93],
  ['25/04','MLS','Chicago Fire','Sporting Kansas City','HDP','FT','Chicago Fire -2.5',1.892,10,'P',-10],
  ['25/04','MLS','Columbus Crew','Philadelphia Union','OU','FT','Mais de 9.5',1.980,10,'P',-10],
  ['25/04','MLS','D.C. United','Orlando City','OU','FT','Menos de 9.5',2.000,10,'P',-10],
  ['25/04','MLS','FC Cincinnati','New York Red Bulls','HDP','FT','FC Cincinnati -0.5',1.943,10,'P',-10],
  ['25/04','MLS','Inter Miami','New England Revolution','HDP','FT','Inter Miami -3',1.943,10,'G',9.43],
  ['25/04','MLS','Minnesota United','Los Angeles FC','HDP','FT','Los Angeles FC -0.5',1.990,10,'P',-10],
  ['25/04','MLS','Nashville SC','Charlotte FC','HDP','FT','Nashville SC -2',1.800,10,'R',0],
  ['25/04','MLS','San Diego FC','Portland Timbers','HDP','FT','San Diego FC -2',1.800,10,'P',-10],
  ['25/04','MLS','Seattle Sounders','FC Dallas','HDP','FT','FC Dallas +1.5',1.934,10,'G',9.34],
  ['25/04','MLS','St Louis City SC','San Jose Earthquakes','HDP','FT','St Louis City SC -0.5',1.862,10,'G',8.62],
  ['25/04','MLS','Toronto FC','Atlanta United','HDP','FT','Toronto FC -1',1.833,10,'R',0],
  ['25/04','MLS','Toronto FC','Atlanta United','OU','FT','Mais de 10',1.961,10,'G',9.61],
  ['25/04','MLS','Vancouver Whitecaps','Colorado Rapids','HDP','FT','Vancouver Whitecaps -3',1.847,10,'G',8.47],

  // ═══ USL (24) ═══
  ['02/05','USL','Tampa Bay Rowdies','','HDP','FT','Tampa Bay Rowdies -1',1.813,10,'P',-10],
  ['02/05','USL','Tampa Bay Rowdies','','HDP','FT','Tampa Bay Rowdies -2.5',1.990,10,'G',9.90],
  ['02/05','USL','Charleston Battery','Sporting Club Jacksonville','OU','FT','Menos de 9',1.900,10,'P',-10],
  ['02/05','USL','Detroit City','Louisville City','HDP','FT','Louisville City 0.0',1.800,10,'P',-10],
  ['02/05','USL','Las Vegas Lights','Lexington SC','HDP','FT','Lexington SC -0.5',1.970,10,'P',-10],
  ['02/05','USL','Loudoun United','Oakland Roots','OU','FT','Menos de 8.5',1.943,10,'P',-10],
  ['02/05','USL','Miami Fc','Brooklyn FC','OU','FT','Menos de 9',1.877,10,'P',-10],
  ['02/05','USL','Miami Fc','Brooklyn FC','OU','HT','Menos de 4',1.952,10,'R',0],
  ['02/05','USL','Sacramento Republic','Orange County','OU','FT','Menos de 9',1.787,13,'P',-13],
  ['02/05','USL','Sacramento Republic','Orange County','OU','HT','Menos de 4',1.909,10,'P',-10],
  ['02/05','USL','San Antonio','Colorado Springs Switchbacks','HDP','FT','Colorado Springs Switchbacks -0.5',1.970,10,'P',-10],
  ['02/05','USL','San Antonio','Colorado Springs Switchbacks','OU','FT','Menos de 9',1.800,10,'G',8.00],
  ['02/05','USL','San Antonio','Colorado Springs Switchbacks','OU','HT','Menos de 4',1.900,10,'G',9.00],
  ['10/04','USL','Loudoun United','Louisville City','HDP','FT','Louisville City -2',2.000,10,'G',10.00],
  ['10/04','USL','Loudoun United','Louisville City','HDP','FT','Louisville City -1.5',1.813,13,'G',10.57],
  ['10/04','USL','Loudoun United','Louisville City','HDP','HT','Louisville City -1',1.943,10,'G',9.43],
  ['10/04','USL','Loudoun United','Louisville City','OU','FT','Mais de 10',2.080,10,'G',10.80],
  ['10/04','USL','Loudoun United','Louisville City','OU','HT','Mais de 4',1.657,13.89,'G',9.13],
  ['10/04','USL','Loudoun United','Louisville City','TT','FT','Louisville City Mais de 5.5',1.869,10,'G',8.69],
  ['11/04','USL','Detroit City','Sporting Club Jacksonville','OU','FT','Mais de 8',2.020,10,'P',-10],
  ['17/04','USL','Charleston Battery','Tampa Bay Rowdies','HDP','FT','Tampa Bay Rowdies +0.5',2.010,10,'P',-10],
  ['26/04','USL','Chacarita Juniors','Ferrocarril Midland','OU','FT','Menos de 8',1.884,10,'G',8.84],
  ['26/04','USL','Chacarita Juniors','Ferrocarril Midland','OU','FT','Menos de 8',1.884,10,'G',8.84],
  ['26/04','USL','Chacarita Juniors','Ferrocarril Midland','HDP','FT','Ferrocarril Midland +1',2.110,10,'R',0],

  // ═══ EQUADOR (6) ═══
  ['17/04','ECU','Emelec','Guayaquil City','HDP','HT','Emelec -1.5',2.100,10,'P',-10],
  ['17/04','ECU','Leones del Norte','Aucas','HDP','FT','Aucas -0.5',1.884,11.91,'P',-11.91],
  ['17/04','ECU','Leones del Norte','Aucas','HDP','HT','Aucas -0.5',2.050,11,'P',-11],
  ['17/04','ECU','Mushuc Runa','Tecnico Universitario','HDP','HT','Mushuc Runa -0.5',1.806,10,'G',8.06],
  ['18/04','ECU','Orense','Delfin','HDP','FT','Delfin +2.5',1.740,10,'P',-10],
  ['18/04','ECU','Orense','Delfin','HDP','HT','Delfin +0.5',2.100,10,'P',-10],

  // ═══ J1 LEAGUE (37) ═══
  ['01/05','J1','Cerezo Osaka','Avispa Fukuoka','HDP','FT','Avispa Fukuoka +0.5',2.050,10,'P',-10],
  ['01/05','J1','Fagiano Okayama','Sanfrecce Hiroshima','HDP','FT','Sanfrecce Hiroshima -1.5',1.961,10,'P',-10],
  ['01/05','J1','Fagiano Okayama','Sanfrecce Hiroshima','HDP','HT','Sanfrecce Hiroshima -1',2.130,10,'P',-10],
  ['01/05','J1','Gamba Osaka','Vissel Kobe','HDP','FT','Gamba Osaka -1',2.040,10,'P',-10],
  ['01/05','J1','Tokyo Verdy','Kashiwa Reysol','HDP','FT','Kashiwa Reysol -1',1.900,10,'G',9.00],
  ['17/04','J1','Kashima Antlers','Urawa Red Diamonds','HDP','FT','Kashima Antlers -1',1.800,12.50,'G',10.00],
  ['17/04','J1','Sanfrecce Hiroshima','V-Varen Nagasaki','HDP','FT','Sanfrecce Hiroshima -2.5',1.934,10.76,'G',10.05],
  ['17/04','J1','Sanfrecce Hiroshima','V-Varen Nagasaki','HDP','HT','Sanfrecce Hiroshima -1',1.800,13,'G',10.40],
  ['17/04','J1','Yokohama F. Marinos','Kawasaki Frontale','HDP','FT','Yokohama F. Marinos -0.5',1.952,11,'P',-11],
  ['17/04','J1','Yokohama F. Marinos','Kawasaki Frontale','HDP','HT','Yokohama F. Marinos 0.0',1.840,10,'R',0],
  ['18/04','J1','Cerezo Osaka','Kyoto Sanga','HDP','FT','Kyoto Sanga +0.5',1.934,10,'G',9.34],
  ['18/04','J1','Tokyo Verdy','JEF United Chiba','OU','FT','Menos de 9.5',1.800,10,'G',8.00],
  ['18/04','J1','Tokyo Verdy','JEF United Chiba','OU','HT','Menos de 4',2.020,10,'G',10.20],
  ['22/04','J1','Gamba Osaka','Avispa Fukuoka','OU','FT','Menos de 9',1.862,12,'P',-12],
  ['24/04','J1','Fagiano Okayama','Avispa Fukuoka','HDP','FT','Fagiano Okayama -1.5',2.230,8,'P',-8],
  ['24/04','J1','Fagiano Okayama','Avispa Fukuoka','HDP','FT','Fagiano Okayama -1',2.040,10,'P',-10],
  ['24/04','J1','Fagiano Okayama','Avispa Fukuoka','HDP','HT','Fagiano Okayama -0.5',2.010,10,'P',-10],
  ['24/04','J1','Fagiano Okayama','Avispa Fukuoka','OU','FT','Mais de 9.5',1.909,10,'G',9.09],
  ['24/04','J1','Kawasaki Frontale','JEF United Chiba','HDP','FT','Kawasaki Frontale -1',1.684,10,'G',6.84],
  ['24/04','J1','Kawasaki Frontale','JEF United Chiba','OU','FT','Menos de 9.5',1.934,10,'G',9.34],
  ['24/04','J1','Kawasaki Frontale','JEF United Chiba','OU','HT','Menos de 4',2.070,10,'G',10.70],
  ['24/04','J1','Sanfrecce Hiroshima','Cerezo Osaka','HDP','FT','Sanfrecce Hiroshima -2',1.943,10.67,'G',10.06],
  ['24/04','J1','Sanfrecce Hiroshima','Cerezo Osaka','HDP','HT','Sanfrecce Hiroshima -1',1.961,10,'G',9.61],
  ['24/04','J1','Sanfrecce Hiroshima','Cerezo Osaka','OU','FT','Mais de 10',1.961,10,'G',9.61],
  ['24/04','J1','Shimizu S-Pulse','Nagoya Grampus','HDP','FT','Shimizu S-Pulse -1',2.240,10,'P',-10],
  ['24/04','J1','Urawa Red Diamonds','Yokohama F. Marinos','OU','FT','Menos de 9.5',2.090,10,'P',-10],
  ['24/04','J1','V-Varen Nagasaki','Gamba Osaka','HDP','FT','V-Varen Nagasaki 0.0',2.140,10,'P',-10],
  ['24/04','J1','V-Varen Nagasaki','Gamba Osaka','OU','FT','Menos de 9',2.000,10,'P',-10],
  ['24/04','J1','V-Varen Nagasaki','Gamba Osaka','OU','FT','Menos de 9',2.000,10,'P',-10],
  ['24/04','J1','V-Varen Nagasaki','Gamba Osaka','OU','HT','Menos de 4',1.961,10,'P',-10],
  ['25/04','J1','V-Varen Nagasaki','Gamba Osaka','TT','FT','Gamba Osaka Mais de 7.5',1.869,10,'G',8.69],
  ['25/04','J1','V-Varen Nagasaki','Gamba Osaka','TT','FT','V-Varen Nagasaki Mais de 5',1.735,10,'G',7.35],
  ['29/04','J1','Avispa Fukuoka','Sanfrecce Hiroshima','OU','FT','Menos de 8.5',1.943,10,'G',9.43],
  ['29/04','J1','Nagoya Grampus','Fagiano Okayama','HDP','FT','Nagoya Grampus -1',1.980,10,'G',9.80],
  ['29/04','J1','Urawa Red Diamonds','Kawasaki Frontale','OU','FT','Menos de 10',1.854,10,'R',0],
  ['29/04','J1','Urawa Red Diamonds','Kawasaki Frontale','OU','HT','Menos de 4.5',1.862,12,'P',-12],
  ['29/04','J1','Vissel Kobe','Cerezo Osaka','HDP','FT','Vissel Kobe -1.5',1.840,12,'G',10.08]
];

// ═══════════════════════════════════════════════════════════════
// ANÁLISE
// ═══════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════════════');
console.log('ANÁLISE DE 358 APOSTAS REAIS — Abr-Mai 2026');
console.log('═══════════════════════════════════════════════════════════');
console.log('Total de apostas no array: ' + APOSTAS.length);
console.log();

const _zero = () => ({ g:0, p:0, r:0, lp:0, risco:0 });

function add(m, ap) {
  if (ap[9] === 'G') m.g++;
  else if (ap[9] === 'P') m.p++;
  else m.r++;
  m.lp += ap[10];
  m.risco += ap[8];
}

const taxa = (m) => {
  const tot = m.g + m.p + m.r;
  const den = m.g + m.p; // exclui REEMB
  if (den === 0) return '—';
  const win = (100 * m.g / den).toFixed(1);
  const roi = m.risco > 0 ? ((100 * m.lp / m.risco).toFixed(1)) : '—';
  return `${win}% win · ${m.lp >= 0 ? '+' : ''}R$${m.lp.toFixed(2)} · ROI ${roi}% · n=${tot} (${m.g}G ${m.p}P ${m.r}R)`;
};

// ── ANÁLISE 1: POR MERCADO (HDP vs OU vs TT) ──
console.log('🎯 ANÁLISE 1 — POR MERCADO');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const porMercado = { HDP: _zero(), OU: _zero(), TT: _zero() };
APOSTAS.forEach(a => { if (porMercado[a[4]]) add(porMercado[a[4]], a); });
Object.entries(porMercado).forEach(([k,m]) => console.log('  ' + k.padEnd(4) + ': ' + taxa(m)));
console.log();

// ── ANÁLISE 2: POR PERÍODO (HT vs FT) ──
console.log('🎯 ANÁLISE 2 — POR PERÍODO');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const porPeriodo = { HT: _zero(), FT: _zero() };
APOSTAS.forEach(a => { if (porPeriodo[a[5]]) add(porPeriodo[a[5]], a); });
Object.entries(porPeriodo).forEach(([k,m]) => console.log('  ' + k.padEnd(3) + ': ' + taxa(m)));
console.log();

// ── ANÁLISE 3: MERCADO × PERÍODO ──
console.log('🎯 ANÁLISE 3 — MERCADO × PERÍODO');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const cross = {};
APOSTAS.forEach(a => {
  const k = a[4] + ' ' + a[5];
  if (!cross[k]) cross[k] = _zero();
  add(cross[k], a);
});
Object.entries(cross).forEach(([k,m]) => console.log('  ' + k.padEnd(8) + ': ' + taxa(m)));
console.log();

// ── ANÁLISE 4: POR LIGA ──
console.log('🌍 ANÁLISE 4 — POR LIGA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const porLiga = {};
APOSTAS.forEach(a => {
  if (!porLiga[a[1]]) porLiga[a[1]] = _zero();
  add(porLiga[a[1]], a);
});
Object.entries(porLiga).sort((a,b) => b[1].lp - a[1].lp).forEach(([k,m]) => console.log('  ' + k.padEnd(6) + ': ' + taxa(m)));
console.log();

// ── ANÁLISE 5: POR LIGA × MERCADO (combos com viés) ──
console.log('🎯 ANÁLISE 5 — LIGA × MERCADO (combos com viés)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const ligaMercado = {};
APOSTAS.forEach(a => {
  const k = a[1] + ' ' + a[4] + ' ' + a[5];
  if (!ligaMercado[k]) ligaMercado[k] = _zero();
  add(ligaMercado[k], a);
});
const arr5 = Object.entries(ligaMercado).filter(([k,m]) => (m.g+m.p) >= 4);
arr5.sort((a,b) => b[1].lp - a[1].lp);
console.log('Top GANHADORES (n>=4):');
arr5.slice(0, 10).forEach(([k,m]) => console.log('  ' + k.padEnd(15) + ': ' + taxa(m)));
console.log();
console.log('Top PERDEDORES (n>=4):');
arr5.slice(-10).reverse().forEach(([k,m]) => console.log('  ' + k.padEnd(15) + ': ' + taxa(m)));
console.log();

// ── ANÁLISE 6: HDP por linha ──
console.log('🎯 ANÁLISE 6 — HDP POR LINHA (HDP FT)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
function extraiLinha(selecao) {
  const m = selecao.match(/[+-]?[\d.]+$/);
  if (!m) return null;
  return parseFloat(m[0]);
}
const porLinhaHDP = {};
APOSTAS.filter(a => a[4] === 'HDP' && a[5] === 'FT').forEach(a => {
  const linha = extraiLinha(a[6]);
  if (linha === null) return;
  // Agrupa em faixas
  const faixa = linha === 0 ? '0.0' : (Math.abs(linha) <= 0.5 ? '±0.5' : Math.abs(linha) <= 1 ? '±1' : Math.abs(linha) <= 1.5 ? '±1.5' : Math.abs(linha) <= 2 ? '±2' : Math.abs(linha) <= 2.5 ? '±2.5' : Math.abs(linha) <= 3 ? '±3' : '>3');
  if (!porLinhaHDP[faixa]) porLinhaHDP[faixa] = _zero();
  add(porLinhaHDP[faixa], a);
});
const ordemLinha = ['0.0','±0.5','±1','±1.5','±2','±2.5','±3','>3'];
ordemLinha.forEach(k => {
  if (porLinhaHDP[k]) console.log('  ' + k.padEnd(6) + ': ' + taxa(porLinhaHDP[k]));
});
console.log();

// ── ANÁLISE 7: OU OVER vs UNDER ──
console.log('🎯 ANÁLISE 7 — OVER vs UNDER (OU)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const porSide = { OVER: _zero(), UNDER: _zero() };
APOSTAS.filter(a => a[4] === 'OU').forEach(a => {
  const isOver = a[6].toLowerCase().includes('mais') || a[6].toLowerCase().includes('over');
  const isUnder = a[6].toLowerCase().includes('menos') || a[6].toLowerCase().includes('under');
  if (isOver) add(porSide.OVER, a);
  else if (isUnder) add(porSide.UNDER, a);
});
console.log('  OVER : ' + taxa(porSide.OVER));
console.log('  UNDER: ' + taxa(porSide.UNDER));
console.log();

// ── ANÁLISE 8: OU OVER vs UNDER por período ──
console.log('🎯 ANÁLISE 8 — OVER/UNDER × PERÍODO');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const ouCross = { 'UNDER FT': _zero(), 'UNDER HT': _zero(), 'OVER FT': _zero(), 'OVER HT': _zero() };
APOSTAS.filter(a => a[4] === 'OU').forEach(a => {
  const isOver = a[6].toLowerCase().includes('mais') || a[6].toLowerCase().includes('over');
  const k = (isOver ? 'OVER ' : 'UNDER ') + a[5];
  if (ouCross[k]) add(ouCross[k], a);
});
Object.entries(ouCross).forEach(([k,m]) => console.log('  ' + k.padEnd(10) + ': ' + taxa(m)));
console.log();

// ── ANÁLISE 9: POR FAIXA DE ODD ──
console.log('🎯 ANÁLISE 9 — POR FAIXA DE ODD');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const porOdd = {
  '<1.70':_zero(), '1.70-1.85':_zero(), '1.85-2.00':_zero(),
  '2.00-2.20':_zero(), '>2.20':_zero()
};
APOSTAS.forEach(a => {
  const o = a[7];
  let f = '<1.70';
  if (o >= 2.20) f = '>2.20';
  else if (o >= 2.00) f = '2.00-2.20';
  else if (o >= 1.85) f = '1.85-2.00';
  else if (o >= 1.70) f = '1.70-1.85';
  add(porOdd[f], a);
});
Object.entries(porOdd).forEach(([k,m]) => console.log('  ' + k.padEnd(11) + ': ' + taxa(m)));
console.log();

// ── ANÁLISE 10: POR DATA (drift temporal) ──
console.log('🎯 ANÁLISE 10 — POR SEMANA (drift temporal)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
function semana(data) {
  const m = data.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return 'X';
  const dia = parseInt(m[1]), mes = parseInt(m[2]);
  if (mes === 4 && dia <= 7) return 'Sem 1 (01-07/04)';
  if (mes === 4 && dia <= 14) return 'Sem 2 (08-14/04)';
  if (mes === 4 && dia <= 21) return 'Sem 3 (15-21/04)';
  if (mes === 4 && dia <= 28) return 'Sem 4 (22-28/04)';
  if (mes === 5 || (mes === 4 && dia >= 29)) return 'Sem 5 (29/04-05/05)';
  return 'X';
}
const porSemana = {};
APOSTAS.forEach(a => {
  const s = semana(a[0]);
  if (!porSemana[s]) porSemana[s] = _zero();
  add(porSemana[s], a);
});
Object.keys(porSemana).sort().forEach(k => console.log('  ' + k.padEnd(22) + ': ' + taxa(porSemana[k])));
console.log();

// ── ANÁLISE 11: BR (Série A) detalhe ──
console.log('🚨 ANÁLISE 11 — BRASIL SÉRIE A (perdedora)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const brByMkt = { 'HDP FT':_zero(),'HDP HT':_zero(),'OU FT':_zero(),'OU HT':_zero() };
APOSTAS.filter(a => a[1] === 'BR').forEach(a => {
  const k = a[4] + ' ' + a[5];
  if (brByMkt[k]) add(brByMkt[k], a);
});
Object.entries(brByMkt).forEach(([k,m]) => console.log('  ' + k.padEnd(8) + ': ' + taxa(m)));
console.log();

// ── SALVA JSON pra injetar no app ──
const payload = APOSTAS.map((a, idx) => ({
  id: 'imp_' + idx + '_' + Date.now(),
  data: a[0],
  liga: a[1],
  mandante: a[2],
  visitante: a[3],
  mercado: a[4] + ' ' + a[5],  // ex: "HDP FT"
  selecao: a[6],
  odd: a[7],
  unid: a[8],
  status: a[9] === 'G' ? 'Win' : (a[9] === 'P' ? 'Loss' : 'Refund'),
  lp: a[10]
}));
fs.writeFileSync(path.join(__dirname, '_PAYLOAD_358_APOSTAS.json'), JSON.stringify(payload, null, 2));
console.log('💾 JSON salvo em scraper/_PAYLOAD_358_APOSTAS.json (' + payload.length + ' apostas)');
