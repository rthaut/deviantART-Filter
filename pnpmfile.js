module.exports = {
    'hooks': {
        readPackage(pkg) {
            switch (pkg.name) {
                case 'gulp-less':
                    pkg.dependencies['less'] = '^3.0.4';
                    break;
                case 'verb':
                    pkg.dependencies['error-symbol'] = '^0.1.0';
                    pkg.dependencies['info-symbol'] = '^0.1.0';
                    pkg.dependencies['success-symbol'] = '^0.1.0';
                    pkg.dependencies['warning-symbol'] = '^0.1.0';
                    pkg.dependencies['time-stamp'] = '^2.0.0';
                    break;
                case 'web-ext':
                    pkg.dependencies['colors'] = '^1.1.2';
                    pkg.dependencies['es6-promise'] = '^4.2.4';
                    pkg.dependencies['js-select'] = '^0.6.0';
                    break;
            }
            return pkg;
        }
    }
};
