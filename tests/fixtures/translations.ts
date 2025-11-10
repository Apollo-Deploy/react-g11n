/**
 * Mock translation data for tests
 * 
 * This provides translation fixtures that match the structure expected by tests
 * without requiring actual file loading via fetch.
 */

export const mockTranslations = {
  en: {
    common: {
      welcome: 'Welcome to our application',
      farewell: 'Goodbye!',
      greeting: 'Hello, {{name}}!',
      nested: {
        deep: {
          key: 'Deeply nested value',
          message: 'This is a nested message',
        },
        level: {
          one: 'Level one',
          two: 'Level two',
        },
      },
      errors: {
        notFound: 'Item not found',
        serverError: 'Server error occurred',
        unauthorized: 'You are not authorized',
      },
      actions: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
      },
      items: {
        zero: 'No items',
        one: 'One item',
        other: '{{count}} items',
      },
      ordinal: {
        one: '{{count}}st place',
        two: '{{count}}nd place',
        few: '{{count}}rd place',
        other: '{{count}}th place',
      },
      itemsWithContext: {
        male: {
          one: '{{count}} item for him',
          other: '{{count}} items for him',
        },
        female: {
          one: '{{count}} item for her',
          other: '{{count}} items for her',
        },
      },
    },
    auth: {
      login: 'Log in',
      logout: 'Log out',
      register: 'Register',
    },
  },
  es: {
    common: {
      welcome: 'Bienvenido a nuestra aplicación',
      farewell: '¡Adiós!',
      greeting: '¡Hola, {{name}}!',
      nested: {
        deep: {
          key: 'Valor profundamente anidado',
          message: 'Este es un mensaje anidado',
        },
        level: {
          one: 'Nivel uno',
          two: 'Nivel dos',
        },
      },
      errors: {
        notFound: 'Elemento no encontrado',
        serverError: 'Ocurrió un error del servidor',
        unauthorized: 'No estás autorizado',
      },
      actions: {
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
      },
      items: {
        zero: 'Sin artículos',
        one: 'Un artículo',
        other: '{{count}} artículos',
      },
      ordinal: {
        other: '{{count}}º lugar',
      },
      itemsWithContext: {
        male: {
          one: '{{count}} artículo para él',
          other: '{{count}} artículos para él',
        },
        female: {
          one: '{{count}} artículo para ella',
          other: '{{count}} artículos para ella',
        },
      },
    },
    auth: {
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      register: 'Registrarse',
    },
  },
  fr: {
    common: {
      welcome: 'Bienvenue dans notre application',
      farewell: 'Au revoir !',
      greeting: 'Bonjour, {{name}} !',
      nested: {
        deep: {
          key: 'Valeur profondément imbriquée',
          message: 'Ceci est un message imbriqué',
        },
        level: {
          one: 'Niveau un',
          two: 'Niveau deux',
        },
      },
      errors: {
        notFound: 'Élément non trouvé',
        serverError: 'Une erreur serveur s\'est produite',
        unauthorized: 'Vous n\'êtes pas autorisé',
      },
      actions: {
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
      },
      items: {
        zero: 'Aucun article',
        one: 'Un article',
        other: '{{count}} articles',
      },
      ordinal: {
        one: '{{count}}er place',
        other: '{{count}}ème place',
      },
      itemsWithContext: {
        male: {
          one: '{{count}} article pour lui',
          other: '{{count}} articles pour lui',
        },
        female: {
          one: '{{count}} article pour elle',
          other: '{{count}} articles pour elle',
        },
      },
    },
    auth: {
      login: 'Se connecter',
      logout: 'Se déconnecter',
      register: 'S\'inscrire',
    },
  },
};

/**
 * Mock translation loader for tests
 */
export class MockTranslationLoader {
  async loadTranslation(locale: string, namespace: string): Promise<any> {
    const translations = mockTranslations[locale as keyof typeof mockTranslations];
    if (!translations) {
      return {};
    }
    
    const namespaceData = translations[namespace as keyof typeof translations];
    return namespaceData || {};
  }

  getLoadPath(locale: string, namespace: string): string {
    return `locales/${locale}/${namespace}.json`;
  }
}
