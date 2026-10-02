import type { Metadata } from "next";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import AssetGallery, { type GalleryAsset } from "@/src/components/AssetGallery";
import styles from "./assets.module.css";

export const metadata: Metadata = {
  title: "Nazreen's 3D assets",
  description:
    "Explore interactive 3D game assets created by KenyalangKu 3D Asset Designer Nazreen Bin Abdul Radzak.",
};

const assetDetails: Record<string, Pick<GalleryAsset, "title" | "project" | "description">> = {
  "pavilion-pusaka.fbx": {
    title: "Pavilion",
    project: "PUSAKA",
    description:
      "A pavilion asset for the world of PUSAKA. Rotate and zoom to examine its form and construction from every angle.",
  },
  "watchtower-pusaka.fbx": {
    title: "Watchtower",
    project: "PUSAKA",
    description:
      "A watchtower asset for the world of PUSAKA. Turn the model to examine its form, textures, and construction from every angle.",
  },
};

const assetOrder: Record<string, number> = {
  "pavilion-pusaka.fbx": 0,
  "watchtower-pusaka.fbx": 1,
};

function titleFromFilename(filename: string) {
  return filename
    .replace(/\.fbx$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function getAssets(): Promise<GalleryAsset[]> {
  const directory = join(process.cwd(), "public", "models", "nazreen");
  const entries = await readdir(directory, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && /\.fbx$/i.test(entry.name))
    .sort((a, b) =>
      (assetOrder[a.name] ?? Number.MAX_SAFE_INTEGER) -
        (assetOrder[b.name] ?? Number.MAX_SAFE_INTEGER) ||
      a.name.localeCompare(b.name),
    )
    .map((entry) => ({
      id: entry.name,
      url: `/models/nazreen/${encodeURIComponent(entry.name)}`,
      title: assetDetails[entry.name]?.title ?? titleFromFilename(entry.name),
      project: assetDetails[entry.name]?.project ?? "KenyalangKu",
      description:
        assetDetails[entry.name]?.description ??
        "Explore this 3D asset by Nazreen Bin Abdul Radzak from every angle.",
    }));
}

export default async function NazreenAssetsPage() {
  const assets = await getAssets();

  return (
    <main id="main" className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topline}>
          <Link href="/about" className={styles.backLink}>
            <ArrowLeft size={16} aria-hidden="true" /> Back to About Us
          </Link>
          <span>KENYALANGKU / ASSET STUDIO</span>
        </div>

        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}><i aria-hidden="true" /> NAZREEN BIN ABDUL RADZAK / 3D ASSET DESIGNER</p>
            <h1>Worlds begin <em>with details.</em></h1>
          </div>
          <p className={styles.heroCopy}>
            Explore Nazreen&apos;s game assets in 3D. Choose a model, drag to turn it,
            and zoom in to see the details behind the world.
          </p>
        </header>

        <AssetGallery assets={assets} />

        <div className={styles.closing}>
          <span>ROOTED IN CULTURE · BUILT FOR PLAY</span>
          <Link href="/projects/pusaka">
            Discover PUSAKA <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
