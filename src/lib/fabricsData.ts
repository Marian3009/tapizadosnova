import { type FabricCategory } from "./catalog";

import img_alisio from "@/assets/fabrics/alisio.jpg";
import img_amara from "@/assets/fabrics/amara.jpg";
import img_aran from "@/assets/fabrics/aran.jpg";
import img_bahari from "@/assets/fabrics/bahari.jpg";
import img_boscara from "@/assets/fabrics/boscara.jpg";
import img_camila from "@/assets/fabrics/camila.jpg";
import img_caravan from "@/assets/fabrics/caravan.jpg";
import img_ceylan from "@/assets/fabrics/ceylan.jpg";
import img_clotilde from "@/assets/fabrics/clotilde.jpg";
import img_colette from "@/assets/fabrics/colette.jpg";
import img_grimaldi from "@/assets/fabrics/grimaldi.jpg";
import img_khan from "@/assets/fabrics/khan.jpg";

export type CatalogFabric = { id: string; nombre: string; categoria: FabricCategory; color: string; imagen: string; descripcion: string; coleccion: string; referencia: string };

export const CATALOG_FABRICS: CatalogFabric[] = [
  { id: "gl_alisio_col4", nombre: "ALISIO · Blanco natural", coleccion: "ALISIO", referencia: "COL. 4", categoria: "basico", color: "#cbb89a", imagen: img_alisio, descripcion: "Tejido sostenible de doble ancho diseñado para visillos. Aporta ligereza y movimiento a cualquier espacio." },
  { id: "gl_alisio_col5", nombre: "ALISIO · Crema suave", coleccion: "ALISIO", referencia: "COL. 5", categoria: "basico", color: "#cbb89a", imagen: img_alisio, descripcion: "Tejido sostenible de doble ancho diseñado para visillos. Aporta ligereza y movimiento a cualquier espacio." },
  { id: "gl_alisio_col6", nombre: "ALISIO · Beige claro", coleccion: "ALISIO", referencia: "COL. 6", categoria: "basico", color: "#cbb89a", imagen: img_alisio, descripcion: "Tejido sostenible de doble ancho diseñado para visillos. Aporta ligereza y movimiento a cualquier espacio." },
  { id: "gl_alisio_col8", nombre: "ALISIO · Gris perla", coleccion: "ALISIO", referencia: "COL. 8", categoria: "basico", color: "#cbb89a", imagen: img_alisio, descripcion: "Tejido sostenible de doble ancho diseñado para visillos. Aporta ligereza y movimiento a cualquier espacio." },
  { id: "gl_alisio_col11", nombre: "ALISIO · Gris topo", coleccion: "ALISIO", referencia: "COL. 11", categoria: "basico", color: "#cbb89a", imagen: img_alisio, descripcion: "Tejido sostenible de doble ancho diseñado para visillos. Aporta ligereza y movimiento a cualquier espacio." },
  { id: "gl_alisio_col13", nombre: "ALISIO · Gris medio", coleccion: "ALISIO", referencia: "COL. 13", categoria: "basico", color: "#cbb89a", imagen: img_alisio, descripcion: "Tejido sostenible de doble ancho diseñado para visillos. Aporta ligereza y movimiento a cualquier espacio." },
  { id: "gl_alisio_col15", nombre: "ALISIO · Gris oscuro", coleccion: "ALISIO", referencia: "COL. 15", categoria: "basico", color: "#cbb89a", imagen: img_alisio, descripcion: "Tejido sostenible de doble ancho diseñado para visillos. Aporta ligereza y movimiento a cualquier espacio." },
  { id: "gl_alisio_col16", nombre: "ALISIO · Rosa pálido", coleccion: "ALISIO", referencia: "COL. 16", categoria: "basico", color: "#cbb89a", imagen: img_alisio, descripcion: "Tejido sostenible de doble ancho diseñado para visillos. Aporta ligereza y movimiento a cualquier espacio." },
  { id: "gl_alisio_col20", nombre: "ALISIO · Beige cálido", coleccion: "ALISIO", referencia: "COL. 20", categoria: "basico", color: "#cbb89a", imagen: img_alisio, descripcion: "Tejido sostenible de doble ancho diseñado para visillos. Aporta ligereza y movimiento a cualquier espacio." },
  { id: "gl_alisio_col22", nombre: "ALISIO · Gris verdoso", coleccion: "ALISIO", referencia: "COL. 22", categoria: "basico", color: "#cbb89a", imagen: img_alisio, descripcion: "Tejido sostenible de doble ancho diseñado para visillos. Aporta ligereza y movimiento a cualquier espacio." },
  { id: "gl_alisio_col24", nombre: "ALISIO · Azul grisáceo", coleccion: "ALISIO", referencia: "COL. 24", categoria: "basico", color: "#cbb89a", imagen: img_alisio, descripcion: "Tejido sostenible de doble ancho diseñado para visillos. Aporta ligereza y movimiento a cualquier espacio." },
  { id: "gl_alisio_col25", nombre: "ALISIO · Azul claro", coleccion: "ALISIO", referencia: "COL. 25", categoria: "basico", color: "#cbb89a", imagen: img_alisio, descripcion: "Tejido sostenible de doble ancho diseñado para visillos. Aporta ligereza y movimiento a cualquier espacio." },
  { id: "gl_amara_col1", nombre: "AMARA · Multicolor natural", coleccion: "AMARA", referencia: "COL. 1", categoria: "antimanchas", color: "#cbb89a", imagen: img_amara, descripcion: "Expresa la serenidad espiritual de Oriente y la belleza nacida entre la naturaleza, el arte y la contemplación." },
  { id: "gl_aran_colgris", nombre: "ARAN · Gris", coleccion: "ARAN", referencia: "COL. GRIS", categoria: "premium", color: "#cbb89a", imagen: img_aran, descripcion: "Con un punto trenzado que recuerda al tejido artesanal, aporta calidez y relieve a la decoración." },
  { id: "gl_bahari_colazul", nombre: "BAHARI · Azul con motivos naturales", coleccion: "BAHARI", referencia: "COL. AZUL", categoria: "antimanchas", color: "#cbb89a", imagen: img_bahari, descripcion: "Despliega un paisaje exuberante de vegetación y fauna sobre 100% algodón." },
  { id: "gl_boscara_colotoño", nombre: "BOSCARA · Tonos otoñales", coleccion: "BOSCARA", referencia: "COL. OTOÑO", categoria: "antimanchas", color: "#cbb89a", imagen: img_boscara, descripcion: "Espectacular jacquard que representa un paisaje de flores de otoño en 100% algodón." },
  { id: "gl_camila_colverde", nombre: "CAMILA · Verde con flores", coleccion: "CAMILA", referencia: "COL. VERDE", categoria: "antimanchas", color: "#cbb89a", imagen: img_camila, descripcion: "Combina un diseño floral con la textura natural de una base de espiga en algodón y lino." },
  { id: "gl_caravan_colétnico", nombre: "CARAVAN · Multicolor étnico", coleccion: "CARAVAN", referencia: "COL. ÉTNICO", categoria: "antimanchas", color: "#cbb89a", imagen: img_caravan, descripcion: "Viaja a través de paisajes lejanos y culturas diversas, reflejando la tradición artesana." },
  { id: "gl_ceylan_colverde", nombre: "CEYLAN · Verde natural", coleccion: "CEYLAN", referencia: "COL. VERDE", categoria: "antimanchas", color: "#cbb89a", imagen: img_ceylan, descripcion: "Estampado de hojas anchas y formas orgánicas, realizado sobre base de lino en dos gamas cromáticas." },
  { id: "gl_clotilde_colclásico", nombre: "CLOTILDE · Tonos clásicos", coleccion: "CLOTILDE", referencia: "COL. CLÁSICO", categoria: "premium", color: "#cbb89a", imagen: img_clotilde, descripcion: "Estampado floral con trazos definidos y colores equilibrados, refleja la sofisticación de los diseños clásicos." },
  { id: "gl_colette_colblanco", nombre: "COLETTE · Blanco con rayas", coleccion: "COLETTE", referencia: "COL. BLANCO", categoria: "premium", color: "#cbb89a", imagen: img_colette, descripcion: "Recupera el refinamiento de la decoración francesa, con texturas suaves y rayas." },
  { id: "gl_grimaldi_colrayado", nombre: "GRIMALDI · Multicolor rayado", coleccion: "GRIMALDI", referencia: "COL. RAYADO", categoria: "basico", color: "#cbb89a", imagen: img_grimaldi, descripcion: "Celebra la raya en todas sus versiones con tejidos naturales para cortinas y accesorios." },
  { id: "gl_khan_coltierra", nombre: "KHAN · Tonos tierra", coleccion: "KHAN", referencia: "COL. TIERRA", categoria: "premium", color: "#cbb89a", imagen: img_khan, descripcion: "Viaja entre culturas y legado textil a través de rutas antiguas con mirada contemporánea." },
];
