import React from "react";
import { Link } from "react-router-dom";
import "./article.css";

function Article(props) {
  const { articles } = props;

  return (
    <>
      <h1 className="titrearticles">Montres</h1>
      <div className="article-container">
        {articles && articles.map(article => (
          <Link
           to={{
            pathname: `/article/${article.id}`,
           state: { article } // Assurez-vous que cet état est bien passé
         }}
         key={article.id}
         >
            <div className="article-image-container article">
              <img src={article.image} alt={`Article titled: ${article.titre}`} />
              <h3 className="article-title">{article.titre}</h3>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export default Article;

