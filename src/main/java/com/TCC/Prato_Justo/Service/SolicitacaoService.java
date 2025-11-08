package com.TCC.Prato_Justo.Service;

import com.TCC.Prato_Justo.Interface.SolicitacaoRepository;
import com.TCC.Prato_Justo.Model.Doacao;
import com.TCC.Prato_Justo.Model.Solicitacao;
import com.TCC.Prato_Justo.Model.StatusSolicitacao;
import com.TCC.Prato_Justo.Model.Usuario;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;

    public SolicitacaoService(SolicitacaoRepository solicitacaoRepository) {
        this.solicitacaoRepository = solicitacaoRepository;
    }

    public Solicitacao criar(Doacao doacao, Usuario solicitante) {
        // Verificar se já existe uma solicitação para esta doação por este solicitante
        Optional<Solicitacao> existente = solicitacaoRepository.findByDoacaoIdAndSolicitanteId(
            doacao.getId(), solicitante.getId()
        );
        
        if (existente.isPresent()) {
            Solicitacao solicitacao = existente.get();
            // Se estiver cancelada, reativar
            if (solicitacao.getStatus() == StatusSolicitacao.CANCELADA) {
                solicitacao.setStatus(StatusSolicitacao.SOLICITADA);
                return solicitacaoRepository.save(solicitacao);
            }
            throw new IllegalArgumentException("Você já solicitou esta doação");
        }

        Solicitacao nova = new Solicitacao();
        nova.setDoacao(doacao);
        nova.setSolicitante(solicitante);
        nova.setStatus(StatusSolicitacao.SOLICITADA);
        return solicitacaoRepository.save(nova);
    }

    public List<Solicitacao> listarPorSolicitante(Long solicitanteId) {
        return solicitacaoRepository.findBySolicitanteId(solicitanteId);
    }

    public Optional<Solicitacao> obter(Long id) {
        return solicitacaoRepository.findById(id);
    }

    public Solicitacao atualizarStatus(Long id, StatusSolicitacao novoStatus) {
        Solicitacao solicitacao = solicitacaoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada"));
        solicitacao.setStatus(novoStatus);
        return solicitacaoRepository.save(solicitacao);
    }

    public void cancelar(Long id) {
        Solicitacao solicitacao = solicitacaoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada"));
        solicitacao.setStatus(StatusSolicitacao.CANCELADA);
        solicitacaoRepository.save(solicitacao);
    }
}

