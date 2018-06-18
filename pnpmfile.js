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
            }
            return pkg;
        }
    }
};
