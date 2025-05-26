import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useGameList } from "../hooks/useGameList";
import SearchResults from "./SearchResults";

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
`;

const SearchInput = styled.input`
  justify-self: center;
  border: none;
  padding: 1.1rem 1.6rem;
  font-size: 1.8rem;
  border-radius: 0.7rem;
  width: 40rem;
  transition: all 0.3s;
  color: var(--color-grey-200);

  &::placeholder {
    color: var(--color-grey-500);
  }

  &:focus {
    outline: none;
    box-shadow: 0 2.4rem 2.4rem rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const { data } = useGameList({ name: searchTerm });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/games?search=${encodeURIComponent(searchTerm)}`);
      setShowResults(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setShowResults(e.target.value.length > 0);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <SearchContainer ref={searchRef}>
      <form onSubmit={handleSearch}>
        <SearchInput
          placeholder="Search game..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm.length > 0 && setShowResults(true)}
        />
      </form>
      {showResults && (
        <SearchResults
          games={data?.games?.slice(0, 5) || []}
          onSelect={() => setShowResults(false)}
        />
      )}
    </SearchContainer>
  );
}
