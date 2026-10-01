"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Box, MoveUpRight } from "lucide-react";
import styles from "@/app/about/nazreen/assets/assets.module.css";

export type GalleryAsset = {
  id: string;
  url: string;
  title: string;
  project: string;
  description: string;
};

const ModelViewer = dynamic(() => import("@/src/components/ModelViewer"), {
  ssr: false,
  loading: () => <div className={styles.viewerLoading}>PREPARING 3D VIEWER...</div>,
});

export default function AssetGallery({ assets }: { assets: GalleryAsset[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeAsset = assets[activeIndex];

  if (!activeAsset) {
    return (
      <section className={styles.empty} aria-label="3D asset gallery">
        <Box size={28} aria-hidden="true" />
        <h2>3D assets are on their way.</h2>
        <p>Nazreen&apos;s interactive models will appear here as they join the gallery.</p>
      </section>
    );
  }

  return (
    <section className={styles.gallery} aria-label="Nazreen's interactive 3D assets">
      <div className={styles.galleryHead}>
        <span>THE ASSET COLLECTION</span>
        <span>{String(assets.length).padStart(2, "0")} MODEL{assets.length === 1 ? "" : "S"}</span>
      </div>
      <div className={styles.galleryGrid}>
        <div className={styles.assetList} role="group" aria-label="Select a 3D asset">
          {assets.map((asset, index) => (
            <button
              key={asset.id}
              type="button"
              className={`${styles.assetButton} ${index === activeIndex ? styles.assetButtonActive : ""}`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            >
              <span className={styles.assetNumber}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.assetLabel}>
                <span>{asset.project}</span>
                <strong>{asset.title}</strong>
                <small>INTERACTIVE FBX MODEL</small>
              </span>
              <MoveUpRight size={18} aria-hidden="true" />
            </button>
          ))}
          <p className={styles.listNote}>Select an asset to view its form and textures in 3D.</p>
        </div>

        <div className={styles.assetDetail}>
          <div className={styles.stageTopline}>
            <span><i aria-hidden="true" /> LIVE MODEL VIEW</span>
            <span>{String(activeIndex + 1).padStart(2, "0")} / {String(assets.length).padStart(2, "0")}</span>
          </div>
          <ModelViewer key={activeAsset.id} url={activeAsset.url} name={`${activeAsset.project} ${activeAsset.title}`} />
          <div className={styles.assetCaption}>
            <div>
              <span>{activeAsset.project} / 3D ASSET</span>
              <h2>{activeAsset.title}</h2>
            </div>
            <p>{activeAsset.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
