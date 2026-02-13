import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Pagination,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Hotel as HotelIcon
} from '@mui/icons-material';
import { Quarto, TipoQuarto, StatusQuarto, TipoCama } from '../domain';

interface QuartoListProps {
  quartos: Quarto[];
  onEdit: (quarto: Quarto) => void;
  onAdd: () => void;
  loading?: boolean;
  error?: string;
}

export const QuartoList: React.FC<QuartoListProps> = ({
  quartos,
  onEdit,
  onAdd,
  loading = false,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoQuarto | ''>('');
  const [filtroStatus, setFiltroStatus] = useState<StatusQuarto | ''>('');
  const [pagina, setPagina] = useState(1);
  const [itensPorPagina] = useState(10);

  // Filtrar quartos
  const quartosFiltrados = quartos.filter(quarto => {
    const matchSearch = searchTerm === '' || 
      quarto.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quarto.tipo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTipo = filtroTipo === '' || quarto.tipo === filtroTipo;
    const matchStatus = filtroStatus === '' || quarto.status === filtroStatus;

    return matchSearch && matchTipo && matchStatus;
  });

  // Paginação
  const totalPaginas = Math.ceil(quartosFiltrados.length / itensPorPagina);
  const indiceInicio = (pagina - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const quartosPaginados = quartosFiltrados.slice(indiceInicio, indiceFim);

  const getTipoQuartoLabel = (tipo: TipoQuarto): string => {
    const labels = {
      [TipoQuarto.BASICO]: 'Básico',
      [TipoQuarto.MODERNO]: 'Moderno',
      [TipoQuarto.LUXO]: 'Luxo'
    };
    return labels[tipo];
  };

  const getStatusQuartoLabel = (status: StatusQuarto): string => {
    const labels = {
      [StatusQuarto.DISPONIVEL]: 'Disponível',
      [StatusQuarto.OCUPADO]: 'Ocupado',
      [StatusQuarto.MANUTENCAO]: 'Em Manutenção',
      [StatusQuarto.LIMPEZA]: 'Em Limpeza'
    };
    return labels[status];
  };

  const getStatusQuartoColor = (status: StatusQuarto): 'success' | 'error' | 'warning' | 'info' => {
    const colors = {
      [StatusQuarto.DISPONIVEL]: 'success' as const,
      [StatusQuarto.OCUPADO]: 'error' as const,
      [StatusQuarto.MANUTENCAO]: 'warning' as const,
      [StatusQuarto.LIMPEZA]: 'info' as const
    };
    return colors[status];
  };

  const getTipoCamaLabel = (tipo: TipoCama): string => {
    const labels = {
      [TipoCama.SOLTEIRO]: 'Solteiro',
      [TipoCama.CASAL_KING]: 'King',
      [TipoCama.CASAL_QUEEN]: 'Queen'
    };
    return labels[tipo];
  };

  const formatarPreco = (preco: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const getComodidades = (quarto: Quarto): string[] => {
    const comodidades = [];
    if (quarto.hasMinibar) comodidades.push('Frigobar');
    if (quarto.hasCafeDaManha) comodidades.push('Café da Manhã');
    if (quarto.hasArCondicionado) comodidades.push('Ar-Condicionado');
    if (quarto.hasTV) comodidades.push('TV');
    return comodidades;
  };

  const getDescricaoCamas = (camas: TipoCama[]): string => {
    const contagem = camas.reduce((acc, tipo) => {
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {} as Record<TipoCama, number>);

    return Object.entries(contagem)
      .map(([tipo, quantidade]) => `${quantidade}x ${getTipoCamaLabel(tipo as TipoCama)}`)
      .join(', ');
  };

  const limparFiltros = () => {
    setSearchTerm('');
    setFiltroTipo('');
    setFiltroStatus('');
    setPagina(1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>Carregando quartos...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestão de Quartos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          color="primary"
        >
          Novo Quarto
        </Button>
      </Box>

      {/* Filtros */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar por número ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo do Quarto</InputLabel>
              <Select
                value={filtroTipo}
                label="Tipo do Quarto"
                onChange={(e) => setFiltroTipo(e.target.value as TipoQuarto | '')}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value={TipoQuarto.BASICO}>Básico</MenuItem>
                <MenuItem value={TipoQuarto.MODERNO}>Moderno</MenuItem>
                <MenuItem value={TipoQuarto.LUXO}>Luxo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filtroStatus}
                label="Status"
                onChange={(e) => setFiltroStatus(e.target.value as StatusQuarto | '')}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value={StatusQuarto.DISPONIVEL}>Disponível</MenuItem>
                <MenuItem value={StatusQuarto.OCUPADO}>Ocupado</MenuItem>
                <MenuItem value={StatusQuarto.MANUTENCAO}>Em Manutenção</MenuItem>
                <MenuItem value={StatusQuarto.LIMPEZA}>Em Limpeza</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={limparFiltros}
              disabled={!searchTerm && !filtroTipo && !filtroStatus}
            >
              Limpar Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Resultados */}
      <Box mb={2}>
        <Typography variant="body2" color="textSecondary">
          {quartosFiltrados.length} quarto(s) encontrado(s)
          {quartosFiltrados.length !== quartos.length && 
            ` (de ${quartos.length} no total)`}
        </Typography>
      </Box>

      {/* Tabela */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Capacidade</TableCell>
              <TableCell>Camas</TableCell>
              <TableCell>Preço por Noite</TableCell>
              <TableCell>Comodidades</TableCell>
              <TableCell>Disponibilidade</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quartosPaginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box py={4}>
                    <HotelIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      Nenhum quarto encontrado
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {quartos.length === 0 
                        ? 'Cadastre seu primeiro quarto para começar.'
                        : 'Tente ajustar os filtros para encontrar quartos.'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              quartosPaginados.map((quarto) => (
                <TableRow key={quarto.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {quarto.numero}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getTipoQuartoLabel(quarto.tipo)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {quarto.capacidade} pessoa(s)
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getDescricaoCamas(quarto.camas.map(c => c.tipo))}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {formatarPreco(quarto.precoPorNoite)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {getComodidades(quarto).map((comodidade, index) => (
                        <Chip
                          key={index}
                          label={comodidade}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusQuartoLabel(quarto.status)}
                      color={getStatusQuartoColor(quarto.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar Quarto">
                      <IconButton
                        color="primary"
                        onClick={() => onEdit(quarto)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPaginas}
            page={pagina}
            onChange={(_, novaPagina) => setPagina(novaPagina)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
};
