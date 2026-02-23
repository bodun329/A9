import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ArticlesContext = createContext(null);

export function useArticles() {
  const context = useContext(ArticlesContext);
  if (!context) {
    throw new Error('useArticles must be used inside ArticlesProvider');
  }
  return context;
}

export function ArticlesProvider({ children }) {
  const { user } = useAuth();
  const [savedArticlesByUser, setSavedArticlesByUser] = useState({});

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem('savedArticlesByUser')
    );
    if (stored) {
      setSavedArticlesByUser(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'savedArticlesByUser',
      JSON.stringify(savedArticlesByUser)
    );
  }, [savedArticlesByUser]);

  const saveArticle = (article) => {
    if (!user) return;

    setSavedArticlesByUser((prev) => {
      const userArticles = prev[user.username] || [];

      if (userArticles.find((a) => a.url === article.url)) {
        return prev;
      }

      return {
        ...prev,
        [user.username]: [...userArticles, article],
      };
    });
  };

  const removeArticle = (url) => {
    if (!user) return;

    setSavedArticlesByUser((prev) => ({
      ...prev,
      [user.username]: (prev[user.username] || []).filter(
        (a) => a.url !== url
      ),
    }));
  };

  const isArticleSaved = (url) => {
    if (!user) return false;
    return (savedArticlesByUser[user.username] || []).some(
      (a) => a.url === url
    );
  };

  const getUserSavedArticles = () => {
    if (!user) return [];
    return savedArticlesByUser[user.username] || [];
  };

  const getAllUserArticles = () => {
    return savedArticlesByUser;
  };

  return (
    <ArticlesContext.Provider
      value={{
        saveArticle,
        removeArticle,
        isArticleSaved,
        getUserSavedArticles,
        getAllUserArticles,
      }}
    >
      {children}
    </ArticlesContext.Provider>
  );
}