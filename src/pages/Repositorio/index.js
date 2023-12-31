import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Owner,
  Loading,
  BackButton,
  IssuesList,
  PageActions,
  FilterList,
} from "./styles";
import { FaArrowLeft } from "react-icons/fa";
import api from "../../sevices/api";

export default function Repositorio() {
  const [issues, setIssues] = useState([]);
  const [repositorioInfo, setRepositorioInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState([
    { state: "all", label: "Todas", active: true },
    { state: "open", label: "Abertas", active: false },
    { state: "closed", label: "Fechadas", active: false },
  ]);
  const [filterIndex, setFilterIndex] = useState(0);

  const { repositorio } = useParams();

  useEffect(() => {
    async function load() {
      const nomeRepo = decodeURIComponent(repositorio);
      setLoading(true);
      const [repositorioData, issuesData] = await Promise.all([
        api.get(`/repos/${nomeRepo}`),
        api.get(`/repos/${nomeRepo}/issues`, {
          params: {
            state: filters.find((filter) => filter.active).state,
            per_page: 5,
          },
        }),
      ]);

      setRepositorioInfo(repositorioData.data);
      setIssues(issuesData.data);
      setLoading(false);
    }
    load();
  }, [repositorio]);

  useEffect(() => {
    async function loadIssue() {
      const nomeRepo = decodeURIComponent(repositorio);
      setLoading(true);

      const response = await api.get(`/repos/${nomeRepo}/issues`, {
        params: {
          state: filters[filterIndex].state,
          page,
          per_page: 5,
        },
      });
      setIssues(response.data);
      setLoading(false);
    }
    loadIssue();
  }, [page, repositorio, filters, filterIndex]);

  if (loading) {
    return (
      <Loading>
        <h1>Carregando...</h1>
      </Loading>
    );
  }

  function handlePage(action) {
    setPage(action === "back" ? page - 1 : page + 1);
  }

  function handleFilter(index) {
    setFilterIndex(index);
  }

  return (
    <Container>
      <BackButton to="/">
        <FaArrowLeft color="#000" size={30} />
      </BackButton>
      <Owner>
        <img
          src={repositorioInfo.owner.avatar_url}
          alt={repositorioInfo.owner.login}
        />
        <h1>{repositorioInfo.name}</h1>
        <p>{repositorioInfo.description}</p>
      </Owner>
      <FilterList active={filterIndex}>
        {filters.map((filter, index) => (
          <button
            type="button"
            key={filter.label}
            onClick={() => handleFilter(index)}
          >
            {filter.label}
          </button>
        ))}
      </FilterList>
      <IssuesList>
        {issues.map((issue) => (
          <li key={String(issue.id)}>
            <img src={issue.user.avatar_url} alt={issue.user.login} />
            <div>
              <strong>
                <a href={issue.html_url}>{issue.title}</a>

                {issue.labels.map((label) => (
                  <span key={String(label.id)}>{label.name}</span>
                ))}
              </strong>
              <p>{issue.user.login}</p>
            </div>
          </li>
        ))}
      </IssuesList>
      <PageActions>
        <button
          type="button"
          onClick={() => handlePage("back")}
          disabled={page < 2}
        >
          Voltar
        </button>
        <button type="button" onClick={() => handlePage("next")}>
          Proxima
        </button>
      </PageActions>
    </Container>
  );
}
