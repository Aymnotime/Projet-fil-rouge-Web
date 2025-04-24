import { useEffect, useState } from 'react';
import './matchs.css';

function Matchs(props) {  
  const [matches, setMatches] = useState([]);
  const { equipes } = props;

  const generateMatchs = () => {
    let matchs = [];
    for (let i = 0; i < 10; i++) {
      let equipe1 = equipes[Math.floor(Math.random() * equipes.length)];
      let equipe2 = equipes[Math.floor(Math.random() * equipes.length)];
      let date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 10));
      date.setHours(date.getHours() + Math.floor(Math.random() * 10));
      date.setMinutes(date.getMinutes() + Math.floor(Math.random() * 60));
      matchs.push({
        equipe1: equipe1,
        equipe2: equipe2,
        date: date
      });
    }
    setMatches(matchs);
  }

  useEffect(() => {
    if (equipes.length == 0) return;
    generateMatchs();
  }, [props.equipes])

  return (
    <div className="matchs">
      <h3>Matchs à venir</h3>
      <table className="table table-striped overflow-hidden rounded-4">
        <thead>
          <tr>
            <th></th>
            <th>Equipe 1</th>
            <th></th>
            <th>Equipe 2</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {
            matches.map((match) => {
              return (
                <tr>
                  <td>
                    <img src={"/equipes" + match.equipe1.logo} alt="" />
                  </td>
                  <td>
                    <p>{match.equipe1.nom}</p>
                  </td>
                  <td>
                    <img src={"/equipes" + match.equipe2.logo} alt="" />
                  </td>
                  <td>
                    <p>{match.equipe2.nom}</p>
                  </td>
                  <td>
                    <p>{match.date.toLocaleString()}</p>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  );
}

export default Matchs;
