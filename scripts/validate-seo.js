#!/usr/bin/env node

/**
 * Script de validation SEO automatique pour MDMC
 * Vérifie les éléments SEO critiques après build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DIST_DIR = path.join(__dirname, '../dist');
const REQUIRED_SEO_ELEMENTS = {
  title: true,
  description: true,
  canonical: true,
  ogTitle: true,
  ogDescription: true,
  ogImage: true,
  twitterCard: true,
  hreflang: true,
  schema: true
};

const MDMC_SEO_RULES = {
  titleLength: { min: 30, max: 60 },
  descriptionLength: { min: 120, max: 160 },
  requiredKeywords: ['marketing', 'musical', 'mdmc', 'ads'],
  socialPlatforms: ['og:', 'twitter:']
};

class SEOValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  // Analyser un fichier HTML
  async analyzeHTMLFile(filePath) {
    try {
      const htmlContent = fs.readFileSync(filePath, 'utf-8');
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      
      const fileName = path.basename(filePath);
      console.log(`\n🔍 Analyse SEO: ${fileName}`);
      
      // Vérifications de base
      this.checkTitle(document, fileName);
      this.checkDescription(document, fileName);
      this.checkCanonical(document, fileName);
      this.checkOpenGraph(document, fileName);
      this.checkTwitterCard(document, fileName);
      this.checkHreflang(document, fileName);
      this.checkSchema(document, fileName);
      this.checkImages(document, fileName);
      this.checkAccessibility(document, fileName);
      
    } catch (error) {
      this.errors.push(`❌ Erreur lecture ${filePath}: ${error.message}`);
    }
  }

  // Vérifier le titre
  checkTitle(document, fileName) {
    const title = document.querySelector('title');
    
    if (!title) {
      this.errors.push(`❌ ${fileName}: Balise <title> manquante`);
      return;
    }
    
    const titleText = title.textContent.trim();
    const length = titleText.length;
    
    if (length < MDMC_SEO_RULES.titleLength.min) {
      this.warnings.push(`⚠️ ${fileName}: Titre trop court (${length} caractères, min ${MDMC_SEO_RULES.titleLength.min})`);
    } else if (length > MDMC_SEO_RULES.titleLength.max) {
      this.warnings.push(`⚠️ ${fileName}: Titre trop long (${length} caractères, max ${MDMC_SEO_RULES.titleLength.max})`);
    } else {
      this.success.push(`✅ ${fileName}: Titre optimal (${length} caractères)`);
    }
    
    // Vérifier MDMC dans le titre
    if (!titleText.toLowerCase().includes('mdmc')) {
      this.warnings.push(`⚠️ ${fileName}: Titre ne contient pas "MDMC"`);
    }
  }

  // Vérifier la description
  checkDescription(document, fileName) {
    const description = document.querySelector('meta[name="description"]');
    
    if (!description) {
      this.errors.push(`❌ ${fileName}: Meta description manquante`);
      return;
    }
    
    const descText = description.getAttribute('content').trim();
    const length = descText.length;
    
    if (length < MDMC_SEO_RULES.descriptionLength.min) {
      this.warnings.push(`⚠️ ${fileName}: Description trop courte (${length} caractères, min ${MDMC_SEO_RULES.descriptionLength.min})`);
    } else if (length > MDMC_SEO_RULES.descriptionLength.max) {
      this.warnings.push(`⚠️ ${fileName}: Description trop longue (${length} caractères, max ${MDMC_SEO_RULES.descriptionLength.max})`);
    } else {
      this.success.push(`✅ ${fileName}: Description optimale (${length} caractères)`);
    }
  }

  // Vérifier canonical
  checkCanonical(document, fileName) {
    const canonical = document.querySelector('link[rel="canonical"]');
    
    if (!canonical) {
      this.errors.push(`❌ ${fileName}: URL canonique manquante`);
      return;
    }
    
    const href = canonical.getAttribute('href');
    if (!href.startsWith('https://')) {
      this.errors.push(`❌ ${fileName}: URL canonique doit être HTTPS`);
    } else {
      this.success.push(`✅ ${fileName}: URL canonique présente`);
    }
  }

  // Vérifier Open Graph
  checkOpenGraph(document, fileName) {
    const ogTags = {
      'og:title': document.querySelector('meta[property="og:title"]'),
      'og:description': document.querySelector('meta[property="og:description"]'),
      'og:image': document.querySelector('meta[property="og:image"]'),
      'og:url': document.querySelector('meta[property="og:url"]'),
      'og:type': document.querySelector('meta[property="og:type"]')
    };
    
    let missingOG = [];
    for (const [tag, element] of Object.entries(ogTags)) {
      if (!element) {
        missingOG.push(tag);
      }
    }
    
    if (missingOG.length > 0) {
      this.errors.push(`❌ ${fileName}: Open Graph manquants: ${missingOG.join(', ')}`);
    } else {
      this.success.push(`✅ ${fileName}: Open Graph complet`);
    }
  }

  // Vérifier Twitter Card
  checkTwitterCard(document, fileName) {
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    
    if (!twitterCard || !twitterTitle) {
      this.errors.push(`❌ ${fileName}: Twitter Card incomplet`);
    } else {
      this.success.push(`✅ ${fileName}: Twitter Card présent`);
    }
  }

  // Vérifier hreflang
  checkHreflang(document, fileName) {
    const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
    
    if (hreflangLinks.length === 0) {
      this.warnings.push(`⚠️ ${fileName}: Aucun hreflang trouvé`);
      return;
    }
    
    const languages = Array.from(hreflangLinks).map(link => link.getAttribute('hreflang'));
    const expectedLangs = ['fr', 'en', 'es', 'pt', 'x-default'];
    
    const missingLangs = expectedLangs.filter(lang => !languages.includes(lang));
    
    if (missingLangs.length > 0) {
      this.warnings.push(`⚠️ ${fileName}: Langues hreflang manquantes: ${missingLangs.join(', ')}`);
    } else {
      this.success.push(`✅ ${fileName}: Hreflang complet (${languages.length} langues)`);
    }
  }

  // Vérifier Schema.org
  checkSchema(document, fileName) {
    const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]');
    
    if (schemaScripts.length === 0) {
      this.errors.push(`❌ ${fileName}: Aucun schema JSON-LD trouvé`);
      return;
    }
    
    let validSchemas = 0;
    schemaScripts.forEach((script, index) => {
      try {
        const schema = JSON.parse(script.textContent);
        if (schema['@context'] && schema['@type']) {
          validSchemas++;
        }
      } catch (error) {
        this.errors.push(`❌ ${fileName}: Schema ${index + 1} JSON invalide`);
      }
    });
    
    if (validSchemas > 0) {
      this.success.push(`✅ ${fileName}: ${validSchemas} schema(s) valide(s)`);
    }
  }

  // Vérifier les images
  checkImages(document, fileName) {
    const images = document.querySelectorAll('img');
    let imagesWithoutAlt = 0;
    
    images.forEach(img => {
      if (!img.getAttribute('alt')) {
        imagesWithoutAlt++;
      }
    });
    
    if (imagesWithoutAlt > 0) {
      this.warnings.push(`⚠️ ${fileName}: ${imagesWithoutAlt} image(s) sans attribut alt`);
    } else if (images.length > 0) {
      this.success.push(`✅ ${fileName}: Toutes les images ont un attribut alt`);
    }
  }

  // Vérifier l'accessibilité de base
  checkAccessibility(document, fileName) {
    const issues = [];
    
    // Vérifier la langue
    const html = document.querySelector('html');
    if (!html.getAttribute('lang')) {
      issues.push('attribut lang manquant sur <html>');
    }
    
    // Vérifier les landmarks
    const main = document.querySelector('main');
    const nav = document.querySelector('nav');
    
    if (!main) issues.push('élément <main> manquant');
    if (!nav) issues.push('élément <nav> manquant');
    
    // Vérifier viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      issues.push('meta viewport manquant');
    }
    
    if (issues.length > 0) {
      this.warnings.push(`⚠️ ${fileName}: Accessibilité - ${issues.join(', ')}`);
    } else {
      this.success.push(`✅ ${fileName}: Éléments d'accessibilité présents`);
    }
  }

  // Analyser tous les fichiers HTML
  async analyzeAll() {
    if (!fs.existsSync(DIST_DIR)) {
      this.errors.push(`❌ Dossier dist/ non trouvé. Exécutez 'npm run build' d'abord.`);
      return;
    }
    
    // Trouver tous les fichiers HTML
    const htmlFiles = this.findHTMLFiles(DIST_DIR);
    
    if (htmlFiles.length === 0) {
      this.errors.push(`❌ Aucun fichier HTML trouvé dans ${DIST_DIR}`);
      return;
    }
    
    console.log(`🎯 Analyse SEO de ${htmlFiles.length} fichier(s) HTML...\n`);
    
    // Analyser chaque fichier
    for (const file of htmlFiles) {
      await this.analyzeHTMLFile(file);
    }
  }

  // Trouver récursivement les fichiers HTML
  findHTMLFiles(dir) {
    let htmlFiles = [];
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        htmlFiles = htmlFiles.concat(this.findHTMLFiles(filePath));
      } else if (file.endsWith('.html')) {
        htmlFiles.push(filePath);
      }
    }
    
    return htmlFiles;
  }

  // Générer le rapport final
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RAPPORT SEO MDMC');
    console.log('='.repeat(60));
    
    // Succès
    if (this.success.length > 0) {
      console.log('\n✅ SUCCÈS:');
      this.success.forEach(msg => console.log(`  ${msg}`));
    }
    
    // Avertissements
    if (this.warnings.length > 0) {
      console.log('\n⚠️ AVERTISSEMENTS:');
      this.warnings.forEach(msg => console.log(`  ${msg}`));
    }
    
    // Erreurs
    if (this.errors.length > 0) {
      console.log('\n❌ ERREURS:');
      this.errors.forEach(msg => console.log(`  ${msg}`));
    }
    
    // Résumé
    console.log('\n📈 RÉSUMÉ:');
    console.log(`  ✅ Succès: ${this.success.length}`);
    console.log(`  ⚠️ Avertissements: ${this.warnings.length}`);
    console.log(`  ❌ Erreurs: ${this.errors.length}`);
    
    // Score SEO
    const total = this.success.length + this.warnings.length + this.errors.length;
    const score = total > 0 ? Math.round((this.success.length / total) * 100) : 0;
    
    console.log(`\n🎯 SCORE SEO: ${score}%`);
    
    if (score >= 90) {
      console.log('🏆 EXCELLENT! Votre SEO est optimisé.');
    } else if (score >= 70) {
      console.log('👍 BON. Quelques améliorations possibles.');
    } else if (score >= 50) {
      console.log('⚠️ MOYEN. Optimisations recommandées.');
    } else {
      console.log('🚨 FAIBLE. Optimisations critiques nécessaires.');
    }
    
    console.log('='.repeat(60));
    
    // Exit code pour CI/CD
    if (this.errors.length > 0) {
      process.exit(1);
    }
  }
}

// Exécution
async function main() {
  console.log('🚀 Démarrage validation SEO MDMC...');
  
  const validator = new SEOValidator();
  await validator.analyzeAll();
  validator.generateReport();
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});

// Démarrage
main().catch(console.error);
