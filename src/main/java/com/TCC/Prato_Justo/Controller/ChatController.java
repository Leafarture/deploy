package com.TCC.Prato_Justo.Controller;

import com.TCC.Prato_Justo.Interface.AnthUsuarioRepository;
import com.TCC.Prato_Justo.Interface.MensagemRepository;
import com.TCC.Prato_Justo.Model.Mensagem;
import com.TCC.Prato_Justo.Model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private MensagemRepository mensagemRepository;

    @Autowired
    private AnthUsuarioRepository usuarioRepository;

    // Envia uma mensagem do usuário autenticado para outro usuário (destinatárioId)
    @PostMapping("/messages")
    public ResponseEntity<?> sendMessage(@RequestBody SendMessageRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario remetente = usuarioRepository.findByEmail(email).orElse(null);
        if (remetente == null) {
            return ResponseEntity.status(401).body("Usuário não autenticado");
        }

        Optional<Usuario> destOpt = usuarioRepository.findById(req.getDestinatarioId());
        if (destOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Destinatário não encontrado");
        }
        Usuario destinatario = destOpt.get();

        Mensagem msg = new Mensagem();
        msg.setRemetente(remetente);
        msg.setDestinatario(destinatario);
        msg.setConteudo(req.getConteudo());
        msg.setCriadoEm(LocalDateTime.now());
        msg.setLido(false);

        Mensagem saved = mensagemRepository.save(msg);
        return ResponseEntity.ok(saved);
    }

    // Lista conversa entre usuário autenticado e outro usuário
    @GetMapping("/conversations/{otherUserId}")
    public ResponseEntity<?> getConversation(@PathVariable Long otherUserId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario me = usuarioRepository.findByEmail(email).orElse(null);
        if (me == null) {
            return ResponseEntity.status(401).body("Usuário não autenticado");
        }

        Optional<Usuario> otherOpt = usuarioRepository.findById(otherUserId);
        if (otherOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuário não encontrado");
        }
        Usuario other = otherOpt.get();

        List<Mensagem> conversa = mensagemRepository.conversaEntre(me, other);
        return ResponseEntity.ok(conversa);
    }

    // Lista contatos com quem o usuário já trocou mensagens
    @GetMapping("/contacts")
    public ResponseEntity<?> getContacts() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario me = usuarioRepository.findByEmail(email).orElse(null);
        if (me == null) return ResponseEntity.status(401).body("Usuário não autenticado");

        List<Usuario> contacts = mensagemRepository.findContacts(me);
        return ResponseEntity.ok(contacts);
    }

    // DTO para enviar mensagem
    public static class SendMessageRequest {
        private Long destinatarioId;
        private String conteudo;

        public Long getDestinatarioId() { return destinatarioId; }
        public void setDestinatarioId(Long destinatarioId) { this.destinatarioId = destinatarioId; }
        public String getConteudo() { return conteudo; }
        public void setConteudo(String conteudo) { this.conteudo = conteudo; }
    }
}
