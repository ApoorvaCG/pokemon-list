import { useEffect, useRef, useState } from 'react';
import './App.css';

interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
}

interface PokemonBasicDetails {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  types: {
    type: {
      name: string;
    };
  }[];
}

const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=15';

function App() {
  const [pokemonListData, setPokemonListData] = useState<PokemonListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [listError, setListError] = useState<string>('');
  const [pokemonDetails, setPokemonDetails] = useState<PokemonBasicDetails | null>(null);
  const [currentPage, setCurrentPage] = useState<string>(API_URL);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Fetch Pokemon list
  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        setLoading(true);
        const response = await fetch(currentPage);
        if (response.ok) {
          const data = await response.json();
          // Append new Pokemon results to existing data
          setPokemonListData((prevData) => {
            return prevData ? {
              ...prevData,
              results: [...prevData.results, ...data.results],
              next: data.next,
              previous: data.previous,
              count: data.count,
            } : data;
          });
        } else {
          setListError('Could not load Pokemon data. Please try again.');
        }
      } catch (error) {
        setListError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, [currentPage]);

  // Fetch Pokemon details
  const fetchPokemonDetails = async (pokemonUrl: string) => {
    try {
      setLoading(true);
      const response = await fetch(pokemonUrl);
      if (response.ok) {
        const data = await response.json();
        setPokemonDetails(data);
      } else {
        setListError('Could not load Pokemon details. Please try again.');
      }
    } catch (error) {
      setListError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMorePokemons = () => {
    if (pokemonListData?.next) {
      setCurrentPage(pokemonListData.next);
    }
  };

  // Handle horizontal scroll event
  const handleScroll = () => {
    const container = scrollContainerRef.current;
      if (container && !loading && container.scrollLeft + container.offsetWidth >= container.scrollWidth - 10) {
        loadMorePokemons();
      }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [loading]);

  return (
    <div>
      <h1 style={{ fontFamily: 'Pokemon Solid',fontSize: '3rem', letterSpacing: "0.2rem", textAlign: 'center', fontWeight: 'bolder', color: '#ffcc03', WebkitTextStroke: '2px #356abc' }}>
        Pokémon Directory
      </h1>

      {/* Pokemon List */}
      {listError && <p style={{ color: "red" }}>{listError}</p>}

      <div className="pokemon-container">
        <div className="pokemon-list" ref={scrollContainerRef}>
          {pokemonListData?.results.map((pokemon, index) => (
            <div
              key={index}
              onClick={() => fetchPokemonDetails(pokemon.url)}
              className="pokemon-item"
              style={{ cursor: "pointer", fontFamily: 'Pokemon Solid', fontWeight: 'lighter', letterSpacing: "0.3rem" }}
            >
              {pokemon.name}
            </div>
          ))}
          {loading && <div className="loading-indicator">Loading...</div>}
        </div>
      </div>

      {/* Pokemon Details */}
      {pokemonDetails && (
        <div style={{width:'100%', display:'flex', justifyContent:'center', margin: '20px 0px'}}>
          <div className='pokemon-details' style={{ display: 'flex', width:'max-content', justifyContent: 'center', alignItems: 'center', gap:'4rem' }}>

            <div className="image-container">
            <img
              src={pokemonDetails.sprites.front_default}
              alt={pokemonDetails.name}
              width={100}
            /></div>
            <div style={{display:'flex', flexDirection:'column'}}>
            <h2 style={{fontFamily: 'Pokemon Solid', letterSpacing: "0.2rem", margin:0}}>{pokemonDetails.name}</h2>
            <p style={{fontFamily:'"Irish Grover", roboto', fontSize:'1.25rem', margin:0}}>
              <span >Types:</span>{" "}
              {pokemonDetails.types.map((t, index) => (
                <strong key={index}>{t.type.name}{index < pokemonDetails.types.length - 1 ? ", " : ""}</strong>
              ))}
            </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
