import hero from '../assets/future-technology-matrix.png';
import software from '../assets/digital-transformation.png';
import datacenter from '../assets/datacenter-brand.png';
import solar from '../assets/energy-renewables-brand.png';
import engineering from '../assets/engineering-global-brand.png';
import careers from '../assets/insan-kaynaklari.png';
import sectorsOverview from '../assets/sectors-overview.png';
import publicSector from '../assets/sectors/public.png';
import healthSector from '../assets/sectors/health.png';
import educationSector from '../assets/sectors/education.png';
import industrySector from '../assets/sectors/industry.png';
import energySector from '../assets/sectors/energy.png';
import financeSector from '../assets/sectors/finance.png';
import logisticsSector from '../assets/sectors/logistics.png';
import retailSector from '../assets/sectors/retail.png';
import telecomSector from '../assets/sectors/telecom.png';
import constructionSector from '../assets/sectors/construction.png';
export const sectorImages = {
  publicSector,
  healthSector,
  educationSector,
  industrySector,
  energySector,
  financeSector,
  logisticsSector,
  retailSector,
  telecomSector,
  constructionSector,
};
export const sectorImageKeys = Object.keys(sectorImages) as (keyof typeof sectorImages)[];
export const images = {
  hero,
  software,
  datacenter,
  solar,
  engineering,
  careers,
  sectorsOverview,
  ...sectorImages,
};
export type ImageKey = keyof typeof images;
const imageFocus: Partial<Record<ImageKey, string>> = {
  datacenter: '70% center',
  solar: '85% center',
  engineering: '76% 62%',
  careers: '70% center',
  sectorsOverview: 'center 58%',
};
export const imageFocusFor = (name: string) => imageFocus[name as ImageKey];
export const imageFor = (name: string) => images[name as ImageKey] ?? hero;
