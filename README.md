# LED Screen Tester — Mires & couleurs

Application de bureau Linux (AppImage autonome, Electron) pour tester une dalle LED, LCD ou OLED :
couleurs unies, dégradés, grilles et mires de diagnostic, en plein écran, sans navigateur ni installation.

> **34 mires** réparties en 6 groupes, navigation clavier, panneau de commande discret, cycle
> automatique des couleurs.

## Deux formats

Chaque release publie deux fichiers :

| Fichier | Pour qui | Comment l'utiliser |
| --- | --- | --- |
| `LED-Screen-Tester-<version>-x86_64.AppImage` | Linux, usage quotidien | rendu exécutable, double-clic, démarre en plein écran |
| `LED-Screen-Tester-<version>-web.zip` | n'importe quel système, sans installation | décompresser, ouvrir `index.html` dans un navigateur |

Les deux versions partagent les mêmes mires et les mêmes raccourcis clavier.

## Télécharger et lancer

1. Ouvrez la page [Releases](../../releases) et téléchargez
   `LED-Screen-Tester-<version>-x86_64.AppImage`.
2. Rendez-le exécutable et lancez-le :

```bash
chmod +x LED-Screen-Tester-*.AppImage
./LED-Screen-Tester-*.AppImage
```

Un double-clic depuis le gestionnaire de fichiers fonctionne aussi. L'application démarre
directement en plein écran ; Chromium, Node et les dépendances sont embarqués dans le fichier.

### Dépendances système

- Linux x86_64 avec un serveur graphique X11 ou Wayland (XWayland).
- `libfuse2` pour le montage automatique de l'AppImage. S'il est absent :
  - Debian/Ubuntu : `sudo apt install libfuse2`
  - ou lancez l'application avec `APPIMAGE_EXTRACT_AND_RUN=1 ./LED-Screen-Tester-*.AppImage`.
- Si le bac à sable de Chromium est refusé par le système (certaines distributions récentes) :
  `./LED-Screen-Tester-*.AppImage --no-sandbox`.

### Version navigateur (web)

1. Téléchargez `LED-Screen-Tester-<version>-web.zip` depuis les [Releases](../../releases).
2. Décompressez l'archive et ouvrez `index.html` (double-clic, glisser-déposer dans le
   navigateur, ou `python3 -m http.server` dans le dossier puis <http://localhost:8000>).

Aucune dépendance, aucun build : ce sont trois fichiers statiques (`index.html`,
`styles.css`, `app.js`). Le bouton **Quitter** y est masqué (il n'y a pas de fenêtre à fermer) et
`F` utilise le plein écran du navigateur.

## Raccourcis

| Touche | Action |
| --- | --- |
| `F` ou `F11` | Quitter / remettre le plein écran de la fenêtre |
| `→` / `Espace` | Mire suivante |
| `←` | Mire précédente |
| `H` | Masquer / afficher le panneau latéral |
| `B` | Mire noire (test de fuite de lumière) |
| `W` | Mire blanche |
| `A` | Démarrer / arrêter le cycle automatique |
| `Ctrl+Q` | Quitter l'application |

Le bouton **⛶** de la barre d'outils bascule également le plein écran, et le bouton **Quitter**
ferme l'application.

## Développement

```bash
npm install
npm start        # lance l'application en plein écran
```

Si votre configuration npm bloque les scripts d'installation, téléchargez le binaire Electron
manuellement :

```bash
node node_modules/electron/install.js
```

### Construire les deux versions

```bash
npm run dist    # AppImage  -> dist/LED-Screen-Tester-<version>-x86_64.AppImage
npm run web     # version web -> dist/LED-Screen-Tester-<version>-web.zip
npm run release # les deux
```

L'icône (`build/icon.png`, 512×512) est régénérée sans dépendance par `scripts/make-icon.py`
(voir `npm run icon`). La version web est un simple `zip` de `index.html`, `styles.css` et
`app.js` (script `scripts/build-web.sh`).

## Structure

```
main.js               fenêtre Electron plein écran, raccourcis globaux, IPC
preload.js            pont sécurisé entre l'interface et la fenêtre
index.html            interface (barre d'outils, panneau, zone de rendu)
styles.css            styles de l'interface
app.js                catalogue des mires et logique de rendu canvas
scripts/make-icon.py  génération de l'icône 512×512 (zlib/struct uniquement)
scripts/build-web.sh  empaquetage de la version navigateur (zip)
build/icon.png        icône utilisée par le build
```

## Publication d'une version

```bash
git tag v1.0.0
git push origin v1.0.0
```

Le workflow GitHub Actions (`.github/workflows/release.yml`) construit l'AppImage **et** la version
web, puis attache les deux fichiers à la release correspondante. La compilation peut aussi être
lancée manuellement depuis l'onglet *Actions* (les fichiers restent alors téléchargeables dans
l'artefact du run).

## Licence

MIT — voir [LICENSE](LICENSE).
