import React from 'react';
import { Droplet, CircleDot, ShieldAlert, Zap, Cog, Wrench, Package, Tag } from 'lucide-react';

export const getCategoryIcon = (kategori, className = "w-5 h-5") => {
  const kat = (kategori || '').toLowerCase();
  if (kat.includes('oli') || kat.includes('pelumas')) {
    return <Droplet className={`${className} text-amber-400`} />;
  }
  if (kat.includes('ban')) {
    return <CircleDot className={`${className} text-blue-400`} />;
  }
  if (kat.includes('rem')) {
    return <ShieldAlert className={`${className} text-rose-400`} />;
  }
  if (kat.includes('listrik') || kat.includes('busi') || kat.includes('aki')) {
    return <Zap className={`${className} text-yellow-400`} />;
  }
  if (kat.includes('drive') || kat.includes('rantai') || kat.includes('vbelt') || kat.includes('gear')) {
    return <Cog className={`${className} text-emerald-400`} />;
  }
  if (kat.includes('jasa') || kat.includes('service') || kat.includes('montir')) {
    return <Wrench className={`${className} text-teal-400`} />;
  }
  return <Package className={`${className} text-purple-400`} />;
};
