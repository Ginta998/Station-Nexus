import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";

/* Overlay HUD type NieR / Stellar Blade : scanlines + micro-texte vertical
   + readout bas-gauche, dont le contenu change selon le thème. Global. */

const MICRO = {
  abysse: "淵深海零水静気泡界", neptune: "海界水波深潮静気泡", yorha: "2B9S7GーA2式零壱弐参",
  akira: "ネオ東京紅電力第区", supernova: "火燃焰爆熱光", helios: "陽光金輝熱焔",
  biome: "生葉木根芽緑", monolithe: "鋼機械金属零壱", singularite: "空無黒洞引力",
  glacier: "氷雪結晶冷凍寒", megapole: "都市煙霧電力夜", aurum: "金輝黄金純度",
  blackhole: "虚無暗闇重力無", albatre: "石灰白月静寂", bunny: "兎桃柔光夢",
  olympe: "聖神殿大理石光", neant: "無空虚零",
};
const READOUT = {
  abysse: ["PROFONDEUR <b>−3214 M</b>", "PRESSION 318 BAR", "ABYSSE"],
  neptune: ["PROFONDEUR <b>−3214 M</b>", "PRESSION 318 BAR", "ABYSSE"],
  yorha: ["UNITÉ <b>2B · 9S</b>", "AVANT-POSTE 7G", "DÉSERT"],
  akira: ["NEO-TOKYO <b>第3区</b>", "ÉNERGIE 89%", "紅"],
  supernova: ["TEMPÉRATURE <b>8600 K</b>", "EXPANSION +12%", "BRASIER"],
  biome: ["BIOMASSE <b>+3.1%</b>", "O₂ 98%", "CANOPÉE"],
  monolithe: ["SYSTÈME <b>M-07</b>", "INTÉGRITÉ 100%", "ACIER"],
  singularite: ["HORIZON <b>r=0</b>", "DÉCALAGE ∞", "SINGULARITÉ"],
  albatre: ["RELEVÉ <b>STRATE IV</b>", "ÉROSION 0.2%", "SILENCE"],
  helios: ["FLUX <b>1.4 kW/m²</b>", "HEURE DORÉE", "LUMIÈRE"],
  glacier: ["TEMPÉRATURE <b>−41°C</b>", "GEL · 100%", "GLACIER"],
  megapole: ["POLLUTION <b>187 AQI</b>", "SMOG DENSE", "MÉGAPOLE"],
  aurum: ["RELIQUE <b>AU·79</b>", "PURETÉ 99.9%", "OR"],
  blackhole: ["HORIZON <b>Rs→0</b>", "MARÉE ∞", "ABÎME"],
  olympe: ["ORACLE <b>ΔXII</b>", "MARBRE 100%", "ELYSIUM"],
  neant: ["<b>NÉANT</b>", "PRÉSENCE ?", "VIDE"],
};

function microFor(t) {
  const set = MICRO[t] || "天空海界火水時夢光闇風雷星月零壱弐参";
  let s = "";
  for (let i = 0; i < 64; i++) s += set[Math.floor(Math.random() * set.length)];
  return s;
}

export default function CyberOverlay() {
  const { theme } = useApp();
  const [micro, setMicro] = useState("");
  const [, tick] = useState(0);

  useEffect(() => { setMicro(microFor(theme)); }, [theme]);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 30000); return () => clearInterval(t); }, []);

  const r = READOUT[theme] || ["SYS <b>天</b> ONLINE", "N47.2° · E02.4°", "STATION"];
  const now = new Date();
  const tm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");

  return (
    <div className="sx-cyber" aria-hidden="true">
      <div className="scan2" />
      <div className="micro">{micro}</div>
      <div className="readout">
        <span dangerouslySetInnerHTML={{ __html: r[0] }} /><br />
        <span dangerouslySetInnerHTML={{ __html: r[1] }} /><br />
        {tm} · {r[2]}
      </div>
    </div>
  );
}
