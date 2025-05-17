# ApplicationsWeb-H25-Umaima

## Figma
https://www.figma.com/design/2OqbEfF6KRI5YjAjVX7X65/Inkspire?node-id=0-1&t=DjB6FzbmrvLOZ8V8-1

# Environnement de développement
## Débuter
Allez à la racine du projet à développer:
```
cd projet-masterchess
```

Il faut avoir une base de données mysql avec l'usager root et mot de passe ''(port 3306) et une base de données mongodb avec information par défaut(port 27017) sur pour le cadre de cette demonstration.
Il est impératif de deployer le modèle de dernière version qui se trouve dans le repertoire "resources"(fichiers d'extension .sql) sur la base MySQL. Vous pouvez utiliser MySQL Workbench pour ce faire.
À partir de la racine, nous pouvons procéder a installer l'environnement de développement nodejs:
```
npm install
npm run transfertdb
```

## Configuration
Pour configurer le projet, il vous faut une clé secrète(Secret API Key) Stripe et une clé publique(Publishable API Key) Stripe mises sur les variables d'environement ```STRIPE_SECRETKEY``` et ```REACT_APP_STRIPE_PUBLISHABLEKEY``` de votre Système d'exploitation. Après les avoir ajoutées, n'oubliez pas de re-ouvrir le processus CLI qui va éxecuter la prochaine étape.

## Exécuter
Pour démarrer le projet en développement faites simplement:
```
npm run start
```

Accédez à httpS://localhost:4000.

Comptes test:
```
Gabriel gabriel1
Pro pro1
Noob noob1
```
